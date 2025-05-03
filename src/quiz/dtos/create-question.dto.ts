import { IsString, IsEnum, IsObject, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { QuestionType } from '../interfaces/question-types.interface';

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsObject()
  content: any;

  @IsObject()
  @IsOptional()
  conditionalLogic?: any;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  initialDifficulty?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsString()
  @IsOptional()
  createdBy?: string;
}