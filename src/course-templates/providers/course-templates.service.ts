import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseTemplate } from '../entities/course-template.entity';
import { CreateCourseTemplateDto } from '../dto/create-course-template.dto';
import { UpdateCourseTemplateDto } from '../dto/update-course-template.dto';
import { ApplyTemplateDto } from '../dto/apply-template.dto';
import { ContentBlockService } from './content-block.service';
import { LearningOutcomeService } from './learning-outcome.service';
import { AssessmentStructureService } from './assessment-structure.service';

@Injectable()
export class CourseTemplateService {
  constructor(
    @InjectRepository(CourseTemplate)
    private courseTemplateRepository: Repository<CourseTemplate>,
    private contentBlockService: ContentBlockService,
    private learningOutcomeService: LearningOutcomeService,
    private assessmentStructureService: AssessmentStructureService,
  ) {}

  async create(createCourseTemplateDto: CreateCourseTemplateDto): Promise<CourseTemplate> {
    // Extract related entities
    const { contentBlocks, learningOutcomes, assessmentStructures, ...templateData } = createCourseTemplateDto;
    
    // Create main template
    const newTemplate = this.courseTemplateRepository.create(templateData);
    const savedTemplate = await this.courseTemplateRepository.save(newTemplate);
    
    // Add related entities if provided
    if (contentBlocks) {
      for (const block of contentBlocks) {
        await this.contentBlockService.create({
          ...block,
          templateId: savedTemplate.id,
        });
      }
    }
    
    if (learningOutcomes) {
      for (const outcome of learningOutcomes) {
        await this.learningOutcomeService.create({
          ...outcome,
          templateId: savedTemplate.id,
        });
      }
    }
    
    if (assessmentStructures) {
      for (const assessment of assessmentStructures) {
        await this.assessmentStructureService.create({
          ...assessment,
          templateId: savedTemplate.id,
        });
      }
    }
    
    return this.findOne(savedTemplate.id);
  }

  async findAll(): Promise<CourseTemplate[]> {
    return this.courseTemplateRepository.find({
      relations: ['parentTemplate', 'versions'],
    });
  }

  async findOne(id: string): Promise<CourseTemplate> {
    const template = await this.courseTemplateRepository.findOne({
      where: { id },
      relations: [
        'parentTemplate',
        'versions',
        'contentBlocks', 
        'learningOutcomes', 
        'assessmentStructures'
      ],
    });
    
    if (!template) {
      throw new NotFoundException(`Course template with ID ${id} not found`);
    }
    
    return template;
  }

  async update(id: string, updateCourseTemplateDto: UpdateCourseTemplateDto): Promise<CourseTemplate> {
    const template = await this.findOne(id);
    
    // Extract related entities
    const { contentBlocks, learningOutcomes, assessmentStructures, ...templateData } = updateCourseTemplateDto;
    
    // Update main template
    Object.assign(template, templateData);
    await this.courseTemplateRepository.save(template);
    
    // Handle related entities updates if provided
    if (contentBlocks) {
      // Implementation would depend on how you want to handle updates:
      // - Replace all existing ones
      // - Update existing ones and add new ones
      // - Delete ones not in the new list
      // This is a simplified approach - replace all
      await this.contentBlockService.deleteByTemplateId(id);
      for (const block of contentBlocks) {
        await this.contentBlockService.create({
          ...block,
          templateId: id,
        });
      }
    }
    
    // Similar for other relations
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.courseTemplateRepository.remove(template);
  }

  async extendTemplate(parentId: string, createDto: CreateCourseTemplateDto): Promise<CourseTemplate> {
    // Find parent template with all relations
    const parentTemplate = await this.findOne(parentId);
    
    // Create new template with parent reference
    const newTemplateData = {
      ...createDto,
      parentTemplateId: parentId,
    };
    
    // Deep copy parent relations if not provided in createDto
    if (!createDto.contentBlocks) {
      newTemplateData.contentBlocks = parentTemplate.contentBlocks.map(block => ({
        name: block.name,
        content: block.content,
        blockType: block.blockType,
        metadata: block.metadata,
        isReusable: block.isReusable,
        templateId: null, // Will be set after template creation
      }));
    }
    
    if (!createDto.learningOutcomes) {
      newTemplateData.learningOutcomes = parentTemplate.learningOutcomes.map(outcome => ({
        description: outcome.description,
        category: outcome.category,
        sequenceOrder: outcome.sequenceOrder,
        templateId: null, // Will be set after template creation
      }));
    }
    
    if (!createDto.assessmentStructures) {
      newTemplateData.assessmentStructures = parentTemplate.assessmentStructures.map(assessment => ({
        name: assessment.name,
        assessmentType: assessment.assessmentType,
        weightPercentage: assessment.weightPercentage,
        criteria: assessment.criteria,
        description: assessment.description,
        templateId: null, // Will be set after template creation
      }));
    }
    
    return this.create(newTemplateData);
  }

  async exportTemplate(id: string): Promise<Record<string, any>> {
    const template = await this.findOne(id);
    
    // Convert to plain object and prepare for export
    const exportData = {
      name: template.name,
      description: template.description,
      department: template.department,
      contentBlocks: template.contentBlocks,
      learningOutcomes: template.learningOutcomes,
      assessmentStructures: template.assessmentStructures,
      // Do not include IDs or create/update dates
    };
    
    // Clean up IDs and timestamps
    const cleanData = this.removeIdsAndDates(exportData);
    
    return cleanData;
  }

  async importTemplate(importDto: ImportTemplateDto): Promise<CourseTemplate> {
    // Validate the imported data structure
    // Transform to CreateCourseTemplateDto
    const createDto: CreateCourseTemplateDto = {
      name: importDto.templateData.name,
      description: importDto.templateData.description,
      department: importDto.templateData.department,
      contentBlocks: importDto.templateData.contentBlocks,
      learningOutcomes: importDto.templateData.learningOutcomes,
      assessmentStructures: importDto.templateData.assessmentStructures,
    };
    
    return this.create(createDto);
  }

  async applyToCourses(applyDto: ApplyTemplateDto): Promise<void> {
    // This would need integration with a course service
    // For this implementation, we'll just sketch the functionality
    
    const template = await this.findOne(applyDto.templateId);
    
    // For each course ID, apply the template
    for (const courseId of applyDto.courseIds) {
      await this.applySingleCourse(template, courseId);
    }
  }

  private async applySingleCourse(template: CourseTemplate, courseId: string): Promise<void> {
    // This would interact with your course service
    // For example:
    // const courseService = await this.courseService.findOne(courseId);
    // Apply template properties to course
    // Update course content blocks from template
    // etc.
    
    // For now, we'll just log the operation
    console.log(`Applied template ${template.id} to course ${courseId}`);
  }

  private removeIdsAndDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeIdsAndDates(item));
    }
    
    const result = {};
    for (const key in obj) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && 
          key !== 'templateId' && !key.endsWith('Id')) {
        result[key] = this.removeIdsAndDates(obj[key]);
      }
    }
    
    return result;
  }
}
