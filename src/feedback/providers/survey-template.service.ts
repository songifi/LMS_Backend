import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyTemplate } from '../entities/survey-template.entity';
import { Survey } from '../entities/survey.entity';
import { CreateSurveyTemplateDto } from '../dto/create-survey-template.dto';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { SurveyService } from './survey.service';

@Injectable()
export class SurveyTemplateService {
  constructor(
    @InjectRepository(SurveyTemplate)
    private surveyTemplateRepository: Repository<SurveyTemplate>,
    private surveyService: SurveyService,
  ) {}

  async create(createSurveyTemplateDto: CreateSurveyTemplateDto): Promise<SurveyTemplate> {
    const template = this.surveyTemplateRepository.create(createSurveyTemplateDto);
    return this.surveyTemplateRepository.save(template);
  }

  async findAll(): Promise<SurveyTemplate[]> {
    return this.surveyTemplateRepository.find();
  }

  async findOne(id: string): Promise<SurveyTemplate> {
    const template = await this.surveyTemplateRepository.findOneBy({ id });

    if (!template) {
      throw new NotFoundException(`Survey template with ID "${id}" not found`);
    }

    return template;
  }

  async update(id: string, updateSurveyTemplateDto: Partial<CreateSurveyTemplateDto>): Promise<SurveyTemplate> {
    const template = await this.findOne(id);

    Object.assign(template, updateSurveyTemplateDto);

    return this.surveyTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.surveyTemplateRepository.remove(template);
  }

  async createSurveyFromTemplate(templateId: string, customizations: Record<string, any> = {}): Promise<Survey> {
    const template = await this.findOne(templateId);

    const mergedData = {
      ...template.structure,
      ...customizations,
    };

    // Validate that required fields are present
    if (!mergedData.title || !Array.isArray(mergedData.questions)) {
      throw new BadRequestException('Template must include title and questions');
    }

    const surveyData: CreateSurveyDto = {
      title: mergedData.title,
      questions: mergedData.questions,
      // Include additional optional fields if needed
    };

    return this.surveyService.create(surveyData);
  }

  async findByCategory(category: string): Promise<SurveyTemplate[]> {
    return this.surveyTemplateRepository.find({
      where: { category },
    });
  }
}
