import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { EvaluationPeriod } from '../entities/evaluation-period.entity';
import { Survey } from '../entities/survey.entity';
import { CreateEvaluationPeriodDto } from '../dto/create-evaluation-period.dto';

@Injectable()
export class EvaluationPeriodService {
  constructor(
    @InjectRepository(EvaluationPeriod)
    private evaluationPeriodRepository: Repository<EvaluationPeriod>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  async create(createEvaluationPeriodDto: CreateEvaluationPeriodDto): Promise<EvaluationPeriod> {
    const startDate = new Date(createEvaluationPeriodDto.startDate);
    const endDate = new Date(createEvaluationPeriodDto.endDate);
    
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    
    const evaluationPeriod = this.evaluationPeriodRepository.create({
      ...createEvaluationPeriodDto,
      startDate,
      endDate,
    });
    
    // Handle survey associations if provided
    if (createEvaluationPeriodDto.surveyIds?.length) {
      const surveys = await this.surveyRepository.findBy({
        id: In(createEvaluationPeriodDto.surveyIds),
      });
      
      evaluationPeriod.surveys = surveys;
    }
    
    return this.evaluationPeriodRepository.save(evaluationPeriod);
  }

  async findAll(): Promise<EvaluationPeriod[]> {
    return this.evaluationPeriodRepository.find({
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EvaluationPeriod> {
    const evaluationPeriod = await this.evaluationPeriodRepository.findOne({
      where: { id },
      relations: ['surveys'],
    });
    
    if (!evaluationPeriod) {
      throw new NotFoundException(`Evaluation period with ID "${id}" not found`);
    }
    
    return evaluationPeriod;
  }

  async update(id: string, updateEvaluationPeriodDto: Partial<CreateEvaluationPeriodDto>): Promise<EvaluationPeriod> {
    const evaluationPeriod = await this.findOne(id);
    
    if (updateEvaluationPeriodDto.startDate) {
      evaluationPeriod.startDate = new Date(updateEvaluationPeriodDto.startDate);
    }
    
    if (updateEvaluationPeriodDto.endDate) {
      evaluationPeriod.endDate = new Date(updateEvaluationPeriodDto.endDate);
    }
    
    if (evaluationPeriod.endDate <= evaluationPeriod.startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    
    // Update other fields
    if (updateEvaluationPeriodDto.name) evaluationPeriod.name = updateEvaluationPeriodDto.name;
    if (updateEvaluationPeriodDto.description !== undefined) evaluationPeriod.description = updateEvaluationPeriodDto.description;
    if (updateEvaluationPeriodDto.isActive !== undefined) evaluationPeriod.isActive = updateEvaluationPeriodDto.isActive;
    
    // Handle survey associations if provided
    if (updateEvaluationPeriodDto.surveyIds) {
      const surveys = await this.surveyRepository.findBy({
        id: In(updateEvaluationPeriodDto.surveyIds),
      });
      
      evaluationPeriod.surveys = surveys;
    }
    
    return this.evaluationPeriodRepository.save(evaluationPeriod);
  }

  async remove(id: string): Promise<void> {
    const evaluationPeriod = await this.findOne(id);
    await this.evaluationPeriodRepository.remove(evaluationPeriod);
  }

  async findActive(): Promise<EvaluationPeriod[]> {
    const now = new Date();
    
    return this.evaluationPeriodRepository.find({
      where: {
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      relations: ['surveys'],
    });
  }
}
