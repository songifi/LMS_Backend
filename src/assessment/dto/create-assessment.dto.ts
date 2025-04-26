import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsDate, IsUUID, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '../enums/assessmentType.enum';
import { CreateQuestionDto } from './create-question.dto';

export class CreateAssessmentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsNumber()
  @IsOptional()
  totalPoints?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  allowLateSubmissions?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @IsBoolean()
  @IsOptional()
  enablePlagiarismCheck?: boolean;

  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
  
  // Type-specific properties
  @IsBoolean()
  @IsOptional()
  allowFileSubmissions?: boolean;

  @IsArray()
  @IsOptional()
  allowedFileTypes?: string[];

  @IsNumber()
  @IsOptional()
  maxFileSize?: number;

  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  showCorrectAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  requireProctoring?: boolean;

  @IsBoolean()
  @IsOptional()
  requireWebcam?: boolean;

  showFeedbackImmediately?: boolean;
}