import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  IsEnum,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyStatus } from '../enums/survey-status.enum';
import { CreateQuestionDto } from './create-question.dto';

export class CreateSurveyDto {
  @ApiProperty({ description: 'Survey title', example: 'Course Feedback Q1 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Survey description', 
    example: 'Please provide your feedback on the course content and instruction' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Whether responses are anonymous',
    default: false,
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiProperty({ 
    enum: SurveyStatus, 
    enumName: 'SurveyStatus',
    default: SurveyStatus.DRAFT,
    example: SurveyStatus.DRAFT 
  })
  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @ApiProperty({ 
    description: 'Survey questions', 
    type: [CreateQuestionDto],
    example: [
      {
        text: 'How would you rate the course content?',
        type: 'RATING',
        isRequired: true,
        minValue: 1,
        maxValue: 5,
        minLabel: 'Poor',
        maxLabel: 'Excellent',
        order: 1
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ArrayMinSize(1)
  questions: CreateQuestionDto[];

  @ApiProperty({ 
    description: 'Evaluation period IDs',
    type: [String],
    required: false,
    example: ['550e8400-e29b-41d4-a716-446655440000'] 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evaluationPeriodIds?: string[];
}
