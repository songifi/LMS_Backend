import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateVersion } from '../entities/template-version.entity';
import { CreateTemplateVersionDto } from '../dto/create-template-version.dto';
import { CourseTemplateService } from './course-template.service';

@Injectable()
export class TemplateVersionService {
  constructor(
    @InjectRepository(TemplateVersion)
    private templateVersionRepository: Repository<TemplateVersion>,
    private courseTemplateService: CourseTemplateService,
  ) {}

  async create(createDto: CreateTemplateVersionDto): Promise<TemplateVersion> {
    // Ensure template exists
    await this.courseTemplateService.findOne(createDto.templateId);
    
    // If setting as active, deactivate all other versions
    if (createDto.isActive) {
      await this.deactivateOtherVersions(createDto.templateId);
    }
    
    const newVersion = this.templateVersionRepository.create(createDto);
    return this.templateVersionRepository.save(newVersion);
  }

  async findAll(): Promise<TemplateVersion[]> {
    return this.templateVersionRepository.find({
      relations: ['template'],
    });
  }

  async findByTemplateId(templateId: string): Promise<TemplateVersion[]> {
    return this.templateVersionRepository.find({
      where: { templateId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TemplateVersion> {
    const version = await this.templateVersionRepository.findOne({
      where: { id },
      relations: ['template'],
    });
    
    if (!version) {
      throw new NotFoundException(`Template version with ID ${id} not found`);
    }
    
    return version;
  }

  async setActive(id: string): Promise<TemplateVersion> {
    const version = await this.findOne(id);
    
    // Deactivate all other versions for this template
    await this.deactivateOtherVersions(version.templateId, id);
    
    // Set this version as active
    version.isActive = true;
    return this.templateVersionRepository.save(version);
  }

  private async deactivateOtherVersions(templateId: string, exceptId?: string): Promise<void> {
    const query = this.templateVersionRepository
      .createQueryBuilder('version')
      .update()
      .set({ isActive: false })
      .where('templateId = :templateId', { templateId });
    
    if (exceptId) {
      query.andWhere('id != :exceptId', { exceptId });
    }
    
    await query.execute();
  }
}
