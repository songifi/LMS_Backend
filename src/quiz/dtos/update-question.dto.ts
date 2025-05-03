import { IsString, IsEnum, IsObject, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { QuestionType } from '../interfaces/question-types.interface';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsObject()
  @IsOptional()
  content?: any;

  @IsObject()
  @IsOptional()
  conditionalLogic?: any;

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
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  @IsOptional()
  changeNotes?: string;
}