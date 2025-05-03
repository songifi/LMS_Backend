import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QuestionType } from '../interfaces/question-types.interface';

export class QuestionFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  categoryIds?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  difficultyMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  difficultyMax?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isTemplate?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;
}