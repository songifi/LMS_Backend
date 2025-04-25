import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOperator, In } from 'typeorm';
import { Content, ContentType } from '../entities/content.entity';
import { ContentVersion } from '../entities/content-version.entity';
import { ContentAccess } from '../entities/content-access.entity';
import { ContentMetadata } from '../entities/content-metadata.entity';
import { ContentModule } from '../entities/content-module.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { ContentSearchDto } from '../dto/content-search.dto';
import { CreateContentAccessDto } from '../dto/create-content-access.dto';
import { FileUploadService } from './file-upload.service';
import { UsersService } from 'src/user/providers/user.service';
import { User } from 'src/user/entities/user.entity'; // Import User entity
import { AccessType } from '../enums/accessType.enum';

// Add interface for User with groups
interface UserWithGroups extends User {
  userGroups?: { id: string }[];
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentVersion)
    private readonly versionRepository: Repository<ContentVersion>,
    @InjectRepository(ContentAccess)
    private readonly accessRepository: Repository<ContentAccess>,
    @InjectRepository(ContentMetadata)
    private readonly metadataRepository: Repository<ContentMetadata>,
    @InjectRepository(ContentModule)
    private readonly moduleRepository: Repository<ContentModule>,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createContentDto: CreateContentDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Content> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type based on content type
    this.validateFileType(file, createContentDto.contentType);

    // Use findById instead of findOne
    const user = await this.usersService.findById(userId);
    
    const content = new Content();
    content.title = createContentDto.title;
    content.description = createContentDto.description || ''; // Provide default for undefined
    content.contentType = createContentDto.contentType;
    content.creator = user;
    content.prerequisites = createContentDto.prerequisites || []; // Provide default empty array

    // Handle module assignment if moduleId is provided
    if (createContentDto.moduleId) {
      const module = await this.moduleRepository.findOne({ where: { id: createContentDto.moduleId } });
      if (!module) {
        throw new NotFoundException(`Module with ID ${createContentDto.moduleId} not found`);
      }
      content.module = module;
    }

    // Process file upload
    const { filePath, fileSize, mimeType } = await this.fileUploadService.saveFile(file);
    content.filePath = filePath;
    content.fileSize = fileSize;
    content.mimeType = mimeType;

    // Save content first to get ID
    const savedContent = await this.contentRepository.save(content);

    // Create initial version
    const initialVersion = new ContentVersion();
    initialVersion.content = savedContent;
    initialVersion.version = 1;
    initialVersion.filePath = filePath;
    initialVersion.fileSize = fileSize;
    initialVersion.mimeType = mimeType;
    initialVersion.creator = user;
    await this.versionRepository.save(initialVersion);

    // Create metadata if provided
    if (createContentDto.metadata && createContentDto.metadata.length > 0) {
      const metadataEntities = createContentDto.metadata.map(meta => {
        const metadata = new ContentMetadata();
        metadata.content = savedContent;
        metadata.key = meta.key;
        metadata.value = meta.value;
        metadata.isSearchable = meta.isSearchable || false;
        return metadata;
      });
      await this.metadataRepository.save(metadataEntities);
    }

    // Create default public access rule
    const defaultAccess = new ContentAccess();
    defaultAccess.content = savedContent;
    defaultAccess.accessType = AccessType.PUBLIC; // Use enum instead of string literal
    await this.accessRepository.save(defaultAccess);

    return this.findOne(savedContent.id);
  }

  async findAll(searchDto: ContentSearchDto, user: User): Promise<Content[]> {
    const where: FindOptionsWhere<Content> = {};
    
    if (searchDto.contentTypes && searchDto.contentTypes.length > 0) {
      // Use In operator for array values
      where.contentType = searchDto.contentTypes.length === 1 ? 
                          searchDto.contentTypes[0] : 
                          In(searchDto.contentTypes);
    }
    
    if (searchDto.moduleId) {
      where.module = { id: searchDto.moduleId };
    }
    
    if (searchDto.creatorId) {
      where.creator = { id: Number(searchDto.creatorId) }; // Convert to number if User.id is numeric
    }

    // Get content items that the user has access to
    const content = await this.contentRepository.find({
      where,
      relations: ['creator', 'module', 'metadata'],
      order: { orderIndex: 'ASC', createdAt: 'DESC' },
      skip: searchDto.page ? (searchDto.page - 1) * (searchDto.limit || 10) : 0,
      take: searchDto.limit || 10,
    });

    // Filter by access rules
    return this.filterByAccessRules(content, user);
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['creator', 'module', 'metadata', 'accessRules', 'versions'],
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Content> {
    const content = await this.findOne(id);
    
    // Update basic properties
    if (updateContentDto.title) content.title = updateContentDto.title;
    if (updateContentDto.description !== undefined) content.description = updateContentDto.description || '';
    if (updateContentDto.orderIndex !== undefined) content.orderIndex = updateContentDto.orderIndex;
    if (updateContentDto.prerequisites !== undefined) content.prerequisites = updateContentDto.prerequisites || [];
    
    // Handle module update
    if (updateContentDto.moduleId) {
      const module = await this.moduleRepository.findOne({ where: { id: updateContentDto.moduleId } });
      if (!module) {
        throw new NotFoundException(`Module with ID ${updateContentDto.moduleId} not found`);
      }
      content.module = module;
    }
    
    // Handle publishing state
    if (updateContentDto.isPublished !== undefined) {
      content.isPublished = updateContentDto.isPublished;
      if (updateContentDto.isPublished && !content.publishedAt) {
        content.publishedAt = new Date();
      }
    }
    
    // If file is provided, create a new version
    if (file) {
      this.validateFileType(file, content.contentType);
      
      // Create new version
      await this.createVersion(id, file, 'Updated through content update', userId);
      
      // Update content file info
      const { filePath, fileSize, mimeType } = await this.fileUploadService.saveFile(file);
      content.filePath = filePath;
      content.fileSize = fileSize;
      content.mimeType = mimeType;
    }
    
    // Update metadata if provided
    if (updateContentDto.metadata && updateContentDto.metadata.length > 0) {
      // Delete existing metadata
      await this.metadataRepository.delete({ content: { id } });
      
      // Create new metadata
      const metadataEntities = updateContentDto.metadata.map(meta => {
        const metadata = new ContentMetadata();
        metadata.content = content;
        metadata.key = meta.key;
        metadata.value = meta.value;
        metadata.isSearchable = meta.isSearchable || false;
        return metadata;
      });
      
      await this.metadataRepository.save(metadataEntities);
    }
    
    return this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    
    // Delete related entities first
    await this.metadataRepository.delete({ content: { id } });
    await this.accessRepository.delete({ content: { id } });
    
    // Delete versions and their files
    const versions = await this.versionRepository.find({ where: { content: { id } } });
    for (const version of versions) {
      await this.fileUploadService.deleteFile(version.filePath);
      await this.versionRepository.remove(version);
    }
    
    // Delete main content file
    await this.fileUploadService.deleteFile(content.filePath);
    
    // Delete content entity
    await this.contentRepository.remove(content);
  }

  async createVersion(
    id: string,
    file: Express.Multer.File,
    changeNotes: string | undefined,
    userId: string,
  ): Promise<ContentVersion> {
    const content = await this.findOne(id);
    this.validateFileType(file, content.contentType);
    
    // Get latest version number
    const latestVersion = await this.versionRepository.findOne({
      where: { content: { id } },
      order: { version: 'DESC' },
    });
    
    const versionNumber = latestVersion ? latestVersion.version + 1 : 1;
    
    // Use findById instead of findOne
    const user = await this.usersService.findById(userId);
    
    // Process file upload
    const { filePath, fileSize, mimeType } = await this.fileUploadService.saveFile(file);
    
    // Create new version entity
    const newVersion = new ContentVersion();
    newVersion.content = content;
    newVersion.version = versionNumber;
    newVersion.filePath = filePath;
    newVersion.fileSize = fileSize;
    newVersion.mimeType = mimeType;
    newVersion.changeNotes = changeNotes || ''; // Fix: Provide default empty string when undefined
    newVersion.creator = user;
    
    return this.versionRepository.save(newVersion);
  }

  async getVersions(id: string): Promise<ContentVersion[]> {
    const content = await this.findOne(id);
    
    return this.versionRepository.find({
      where: { content: { id } },
      relations: ['creator'],
      order: { version: 'DESC' },
    });
  }

  async addAccessRule(id: string, accessDto: CreateContentAccessDto): Promise<ContentAccess> {
    const content = await this.findOne(id);
    
    const accessRule = new ContentAccess();
    accessRule.content = content;
    accessRule.accessType = accessDto.accessType;
    accessRule.accessId = accessDto.accessId || '';
    
    if (accessDto.availableFrom) {
      accessRule.availableFrom = new Date(accessDto.availableFrom);
    }
    
    if (accessDto.availableUntil) {
      accessRule.availableUntil = new Date(accessDto.availableUntil);
    }
    
    accessRule.conditions = accessDto.conditions;
    
    return this.accessRepository.save(accessRule);
  }

  private validateFileType(file: Express.Multer.File, contentType: ContentType): void {
    const mimeType = file.mimetype.toLowerCase();
    
    switch (contentType) {
      case ContentType.VIDEO:
        if (!mimeType.startsWith('video/')) {
          throw new BadRequestException('File must be a video');
        }
        break;
      case ContentType.DOCUMENT:
        const validDocumentTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/markdown',
        ];
        if (!validDocumentTypes.includes(mimeType)) {
          throw new BadRequestException('File must be a valid document type');
        }
        break;
      case ContentType.PRESENTATION:
        const validPresentationTypes = [
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.oasis.opendocument.presentation',
        ];
        if (!validPresentationTypes.includes(mimeType)) {
          throw new BadRequestException('File must be a presentation');
        }
        break;
      default:
        // For other types, we allow any file type
        break;
    }
  }

  private async filterByAccessRules(contents: Content[], user: User): Promise<Content[]> {
    const now = new Date();
    const result: Content[] = [];
    
    for (const content of contents) {
      // Get access rules for this content
      const accessRules = await this.accessRepository.find({
        where: { content: { id: content.id } },
      });
      
      // If no access rules, content is not accessible
      if (accessRules.length === 0) {
        continue;
      }
      
      // Check if user has access
      let hasAccess = false;
      
      for (const rule of accessRules) {
        // Check time-based availability
        if (rule.availableFrom && now < rule.availableFrom) {
          continue;
        }
        
        if (rule.availableUntil && now > rule.availableUntil) {
          continue;
        }
        
        // Check access type
        switch (rule.accessType) {
          case AccessType.PUBLIC:
            hasAccess = true;
            break;
          case AccessType.USER:
            if (rule.accessId === user.id.toString()) { // Fix: Convert user.id to string for comparison
              hasAccess = true;
            }
            break;
          case AccessType.ROLE:
            if (user.roles && user.roles.some(role => rule.accessId === user.id.toString())) {
              hasAccess = true;
            }
            break;
          case AccessType.GROUP:
            // Fix: Use type assertion to handle the missing property
            const userWithGroups = user as UserWithGroups;
            if (userWithGroups.userGroups && userWithGroups.userGroups.some(group => group.id === rule.accessId)) {
              hasAccess = true;
            }
            break;
        }
        
        // Check conditions if provided
        if (hasAccess && rule.conditions) {
          hasAccess = this.evaluateConditions(rule.conditions, user);
        }
        
        if (hasAccess) {
          break;
        }
      }
      
      if (hasAccess) {
        result.push(content);
      }
    }
    
    return result;
  }
  
  private evaluateConditions(conditions: any, user: User): boolean {
    // Implement conditional logic here
    // Example:
    // if (conditions.completedContentIds) {
    //   for (const contentId of conditions.completedContentIds) {
    //     if (!user.completedContents.includes(contentId)) {
    //       return false;
    //     }
    //   }
    // }
    
    // Default to true if no conditions implemented
    return true;
  }
}