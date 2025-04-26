import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsObject, IsUUID } from 'class-validator';
import { QuestionType } from '../enums/questionType.enum';

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  content: string;

  @IsObject()
  @IsOptional()
  options?: any;

  @IsObject()
  @IsOptional()
  correctAnswer?: any;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsUUID()
  @IsOptional()
  questionBankId?: string;
}