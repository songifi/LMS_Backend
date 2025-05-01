import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningOutcome } from '../entities/learning-outcome.entity';
import { CreateLearningOutcomeDto } from '../dto/create-learning-outcome.dto';

@Injectable()
export class LearningOutcomeService {
  constructor(
    @InjectRepository(LearningOutcome)
    private learningOutcomeRepository: Repository<LearningOutcome>,
  ) {}

  async create(createDto: CreateLearningOutcomeDto): Promise<LearningOutcome> {
    const newOutcome = this.learningOutcomeRepository.create(createDto);
    return this.learningOutcomeRepository.save(newOutcome);
  }

  async findByTemplateId(templateId: string): Promise<LearningOutcome[]> {
    return this.learningOutcomeRepository.find({
      where: { templateId },
      order: { sequenceOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<LearningOutcome> {
    const outcome = await this.learningOutcomeRepository.findOne({
      where: { id },
    });
    
    if (!outcome) {
      throw new NotFoundException(`Learning outcome with ID ${id} not found`);
    }
    
    return outcome;
  }

  async update(id: string, updateDto: Partial<CreateLearningOutcomeDto>): Promise<LearningOutcome> {
    const outcome = await this.findOne(id);
    Object.assign(outcome, updateDto);
    return this.learningOutcomeRepository.save(outcome);
  }

  async remove(id: string): Promise<void> {
    const outcome = await this.findOne(id);
    await this.learningOutcomeRepository.remove(outcome);
  }

  async deleteByTemplateId(templateId: string): Promise<void> {
    await this.learningOutcomeRepository.delete({ templateId });
  }
}
