import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../entities/response.entity';
import { Survey } from '../entities/survey.entity';
import { CreateResponseDto } from '../dto/create-response.dto';
import { SurveyStatus } from '../enums/survey-status.enum';
import * as crypto from 'crypto';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
  ) {}

  async submitResponse(surveyId: string, createResponseDto: CreateResponseDto, metadata: {
    respondentId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Response> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions'],
    });
    
    if (!survey) {
      throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
    }
    
    if (survey.status !== SurveyStatus.ACTIVE) {
      throw new BadRequestException('Survey is not currently active');
    }
    
    // Validate required questions
    const requiredQuestionIds = survey.questions
      .filter(q => q.isRequired)
      .map(q => q.id);
    
    for (const requiredId of requiredQuestionIds) {
      if (!(requiredId in createResponseDto.data)) {
        throw new BadRequestException(`Required question "${requiredId}" not answered`);
      }
    }
    
    // Handle anonymization if needed
    let { respondentId, ipAddress, userAgent } = metadata;
    
    if (survey.isAnonymous) {
      // Anonymize respondent data if survey is anonymous
      if (respondentId) {
        respondentId = this.anonymize(respondentId);
      }
      
      if (ipAddress) {
        ipAddress = this.anonymize(ipAddress);
      }
      
      if (userAgent) {
        // Just keep browser and OS info, not full user agent
        userAgent = userAgent.split(' ').slice(0, 2).join(' ');
      }
    }
    
    const response = this.responseRepository.create({
      survey,
      data: createResponseDto.data,
      completionTime: createResponseDto.completionTime,
      respondentId,
      ipAddress,
      userAgent,
    });
    
    return this.responseRepository.save(response);
  }

  async getResponsesForSurvey(surveyId: string): Promise<Response[]> {
    const survey = await this.surveyRepository.findOneBy({ id: surveyId });
    
    if (!survey) {
      throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
    }
    
    return this.responseRepository.find({
      where: { surveyId },
      order: { submittedAt: 'ASC' },
    });
  }

  async getResponseCount(surveyId: string): Promise<number> {
    return this.responseRepository.count({
      where: { surveyId },
    });
  }

  private anonymize(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }
}