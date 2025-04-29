import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Survey } from '../entities/survey.entity';
import { EvaluationPeriod } from '../entities/evaluation-period.entity';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { SurveyStatus } from '../enums/survey-status.enum';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(EvaluationPeriod)
    private evaluationPeriodRepository: Repository<EvaluationPeriod>,
  ) {}

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepository.create(createSurveyDto);
    
    // Handle evaluation periods if provided
    if (createSurveyDto.evaluationPeriodIds?.length) {
      const evaluationPeriods = await this.evaluationPeriodRepository.findBy({
        id: In(createSurveyDto.evaluationPeriodIds),
      });
      
      if (evaluationPeriods.length !== createSurveyDto.evaluationPeriodIds.length) {
        throw new BadRequestException('One or more evaluation periods not found');
      }
      
      survey.evaluationPeriods = evaluationPeriods;
    }
    
    return this.surveyRepository.save(survey);
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyRepository.find({
      relations: ['evaluationPeriods'],
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['evaluationPeriods', 'questions', 'questions.options'],
    });
    
    if (!survey) {
      throw new NotFoundException(`Survey with ID "${id}" not found`);
    }
    
    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);

    // Update basic survey properties
    if (updateSurveyDto.title) survey.title = updateSurveyDto.title;
    if (updateSurveyDto.description !== undefined) survey.description = updateSurveyDto.description;
    if (updateSurveyDto.isAnonymous !== undefined) survey.isAnonymous = updateSurveyDto.isAnonymous;
    if (updateSurveyDto.status) survey.status = updateSurveyDto.status;

    // Update evaluation periods if provided
    if (updateSurveyDto.evaluationPeriodIds) {
      const evaluationPeriods = await this.evaluationPeriodRepository.findBy({
        id: In(updateSurveyDto.evaluationPeriodIds),
      });
      
      if (evaluationPeriods.length !== updateSurveyDto.evaluationPeriodIds.length) {
        throw new BadRequestException('One or more evaluation periods not found');
      }
      
      survey.evaluationPeriods = evaluationPeriods;
    }

    // We'll handle questions update in a separate service to avoid complexity here
    
    return this.surveyRepository.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepository.remove(survey);
  }

  async publish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    
    if (survey.status !== SurveyStatus.DRAFT) {
      throw new BadRequestException('Only surveys in DRAFT status can be published');
    }
    
    if (!survey.questions || survey.questions.length === 0) {
      throw new BadRequestException('Cannot publish a survey without questions');
    }
    
    survey.status = SurveyStatus.PUBLISHED;
    return this.surveyRepository.save(survey);
  }

  async activate(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    
    if (survey.status !== SurveyStatus.PUBLISHED) {
      throw new BadRequestException('Only published surveys can be activated');
    }
    
    survey.status = SurveyStatus.ACTIVE;
    return this.surveyRepository.save(survey);
  }

  async close(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    
    if (survey.status !== SurveyStatus.ACTIVE) {
      throw new BadRequestException('Only active surveys can be closed');
    }
    
    survey.status = SurveyStatus.CLOSED;
    return this.surveyRepository.save(survey);
  }

  async archive(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    
    if (survey.status !== SurveyStatus.CLOSED) {
      throw new BadRequestException('Only closed surveys can be archived');
    }
    
    survey.status = SurveyStatus.ARCHIVED;
    return this.surveyRepository.save(survey);
  }

  async getActiveSurveys(): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { status: SurveyStatus.ACTIVE },
      relations: ['evaluationPeriods'],
    });
  }

  async getSurveysByEvaluationPeriod(evaluationPeriodId: string): Promise<Survey[]> {
    return this.surveyRepository
      .createQueryBuilder('survey')
      .innerJoin('survey.evaluationPeriods', 'evaluationPeriod')
      .where('evaluationPeriod.id = :evaluationPeriodId', { evaluationPeriodId })
      .getMany();
  }
}