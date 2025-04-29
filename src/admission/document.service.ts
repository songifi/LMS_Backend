import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusService } from './status.service';
import { ApplicationDocument } from './entities/application-document.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { CreateDocumentRequirementDto, DocumentVerificationDto } from './dto/document.dto';
import { StatusType } from './entities/application-status.entity';
import { Application } from './entities/application.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(ApplicationDocument)
    private documentsRepository: Repository<ApplicationDocument>,
    @InjectRepository(DocumentRequirement)
    private requirementsRepository: Repository<DocumentRequirement>,
    private statusService: StatusService,
    private applicationsRepository: Repository<Application>,
  ) {}

  async findAllRequirements(): Promise<DocumentRequirement[]> {
    return this.requirementsRepository.find();
  }

  async findRequirementsByForm(formId: string): Promise<DocumentRequirement[]> {
    return this.requirementsRepository.find({
      where: { formId },
    });
  }

  async createRequirement(createRequirementDto: CreateDocumentRequirementDto): Promise<DocumentRequirement> {
    const requirement = this.requirementsRepository.create(createRequirementDto);
    return this.requirementsRepository.save(requirement);
  }

  async findDocumentsByApplication(applicationId: string): Promise<ApplicationDocument[]> {
    return this.documentsRepository.find({
      where: { applicationId },
      relations: ['requirement'],
    });
  }

  async uploadDocument(
    applicationId: string,
    requirementId: string,
    file: Express.Multer.File,
  ): Promise<ApplicationDocument> {
    // Check if requirement exists
    const requirement = await this.requirementsRepository.findOne({
      where: { id: requirementId },
    });
    
    if (!requirement) {
      throw new NotFoundException(`Document requirement with ID ${requirementId} not found`);
    }
    
    // Check file type
    if (requirement.allowedFileTypes && requirement.allowedFileTypes.length > 0) {
      const fileExtension = (file.originalname.split('.').pop() ?? '').toLowerCase();
      if (!requirement.allowedFileTypes.includes(fileExtension)) {
        throw new BadRequestException(`File type .${fileExtension} is not allowed. Allowed types: ${requirement.allowedFileTypes.join(', ')}`);
      }
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > requirement.maxFileSizeMB) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${requirement.maxFileSizeMB}MB`);
    }
    
    // Check if max files limit has been reached
    const existingDocuments = await this.documentsRepository.find({
      where: { applicationId, requirementId },
    });
    
    if (existingDocuments.length >= requirement.maxFiles) {
      throw new BadRequestException(`Maximum number of files (${requirement.maxFiles}) for this requirement has been reached`);
    }
    
    // Save file (in a real implementation, you would save to S3, GCS, etc.)
    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    const storagePath = `/uploads/${applicationId}/${filename}`;
    
    // Create document record
    const document = this.documentsRepository.create({
      applicationId,
      requirementId,
      filename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath,
    });
    
    const savedDocument = await this.documentsRepository.save(document);
    
    // Check if all required documents are now uploaded
    await this.checkDocumentCompleteness(applicationId);
    
    return savedDocument;
  }

  async verifyDocument(
    documentId: string,
    verificationDto: DocumentVerificationDto,
    userId: string,
  ): Promise<ApplicationDocument> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    
    document.isVerified = verificationDto.isVerified;
    document.verifiedBy = userId;
    document.verifiedAt = new Date();
    
    if (!verificationDto.isVerified) {
      document.isRejected = true;
      document.rejectionReason = verificationDto.rejectionReason ?? null;
    } else {
      document.isRejected = false;
      document.rejectionReason = null;
    }
    
    return this.documentsRepository.save(document);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    
    // In a real implementation, you would delete from S3/GCS as well
    
    await this.documentsRepository.remove(document);
  }

  private async checkDocumentCompleteness(applicationId: string): Promise<void> {
    // Get all requirements for this application
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['form'],
    });
    
    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }
    
    const requirements = await this.requirementsRepository.find({
      where: { formId: application.formId, isRequired: true },
    });
    
    // Get all uploaded documents
    const documents = await this.documentsRepository.find({
      where: { applicationId },
    });
    
    // Check if all required documents are uploaded
    const missingRequirements = requirements.filter(req => 
      !documents.some(doc => doc.requirementId === req.id)
    );
    
    // If no missing requirements, update status
    if (missingRequirements.length === 0 && requirements.length > 0) {
      await this.statusService.updateStatus(applicationId, {
        status: StatusType.PAYMENT_PENDING,
        notes: 'All required documents uploaded',
      });
    }
  }
}
