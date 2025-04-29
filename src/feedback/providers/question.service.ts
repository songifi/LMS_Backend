import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Survey } from '../entities/survey.entity';
import { CreateQuestionDto } from '../dto/create-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  async addQuestionToSurvey(surveyId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const survey = await this.surveyRepository.findOneBy({ id: surveyId });
    
    if (!survey) {
      throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
    }
    
    const question = this.questionRepository.create({
      ...createQuestionDto,
      survey,
    });
    
    return this.questionRepository.save(question);
  }

  async updateQuestion(id: string, updateQuestionDto: Partial<CreateQuestionDto>): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['options'],
    });
    
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    
    // Update question properties
    Object.assign(question, updateQuestionDto);
    
    return this.questionRepository.save(question);
  }

  async removeQuestion(id: string): Promise<void> {
    const question = await this.questionRepository.findOneBy({ id });
    
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    
    await this.questionRepository.remove(question);
  }

  async reorderQuestions(surveyId: string, questionIds: string[]): Promise<void> {
    for (let i = 0; i < questionIds.length; i++) {
      await this.questionRepository.update(
        { id: questionIds[i], surveyId },
        { order: i }
      );
    }
  }
}