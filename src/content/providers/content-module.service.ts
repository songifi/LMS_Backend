import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentModule } from '../entities/content-module.entity';
import { Content } from '../entities/content.entity';
import { CreateContentModuleDto } from '../dto/create-content-module.dto';
import { UpdateContentModuleDto } from '../dto/update-content-module.dto';
import { UsersService } from 'src/user/providers/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ContentModuleService {
  constructor(
    @InjectRepository(ContentModule)
    private readonly moduleRepository: Repository<ContentModule>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly usersService: UsersService,
  ) {}

  async create(createModuleDto: CreateContentModuleDto, userId: string): Promise<ContentModule> {
    const user = await this.usersService.findById(userId);

    if (!createModuleDto.title) {
      throw new Error('Title is required');
    }

    const module = new ContentModule();
    module.title = createModuleDto.title;
    module.description = createModuleDto.description ?? '';
    module.orderIndex = createModuleDto.orderIndex || 0;
    module.creator = user;

    if (createModuleDto.parentModuleId) {
      const parentModule = await this.moduleRepository.findOne({
        where: { id: createModuleDto.parentModuleId },
      });

      if (!parentModule) {
        throw new NotFoundException(`Parent module with ID ${createModuleDto.parentModuleId} not found`);
      }

      module.parentModule = parentModule;
    }

    return this.moduleRepository.save(module);
  }

  async findAll(user: User): Promise<ContentModule[]> {
    return this.moduleRepository.find({
      relations: ['creator', 'parentModule'],
      order: { orderIndex: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContentModule> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['creator', 'parentModule'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async getModuleContents(id: string, user: User): Promise<Content[]> {
    const module = await this.findOne(id);

    const contents = await this.contentRepository.find({
      where: { module: { id } },
      relations: ['creator', 'metadata'],
      order: { orderIndex: 'ASC', createdAt: 'DESC' },
    });

    return contents.filter(content => content.isPublished || content.creator.id === user.id);
  }

  async update(id: string, updateModuleDto: UpdateContentModuleDto): Promise<ContentModule> {
    const module = await this.findOne(id);

    if (updateModuleDto.title !== undefined) module.title = updateModuleDto.title;
    if (updateModuleDto.description !== undefined) module.description = updateModuleDto.description;
    if (updateModuleDto.orderIndex !== undefined) module.orderIndex = updateModuleDto.orderIndex;

    if (updateModuleDto.parentModuleId) {
      if (updateModuleDto.parentModuleId === id) {
        throw new Error('A module cannot be its own parent');
      }

      const parentModule = await this.moduleRepository.findOne({
        where: { id: updateModuleDto.parentModuleId },
      });

      if (!parentModule) {
        throw new NotFoundException(`Parent module with ID ${updateModuleDto.parentModuleId} not found`);
      }

      module.parentModule = parentModule;
    } else if (updateModuleDto.parentModuleId === null) {
      module.parentModule = undefined;
    }

    if (updateModuleDto.isPublished !== undefined) {
      module.isPublished = updateModuleDto.isPublished;
      if (updateModuleDto.isPublished && !module.publishedAt) {
        module.publishedAt = new Date();
      }
    }

    return this.moduleRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);

    const contentCount = await this.contentRepository.count({
      where: { module: { id } },
    });

    if (contentCount > 0) {
      throw new Error('Cannot delete module with associated content. Move or delete content first.');
    }

    const childModules = await this.moduleRepository.count({
      where: { parentModule: { id } },
    });

    if (childModules > 0) {
      throw new Error('Cannot delete module with child modules. Move or delete child modules first.');
    }

    await this.moduleRepository.remove(module);
  }
}
