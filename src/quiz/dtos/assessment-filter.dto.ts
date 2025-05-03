import { IsString, IsOptional, IsArray, IsBoolean, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AssessmentFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  categoryIds?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  active?: boolean;

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
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;
}