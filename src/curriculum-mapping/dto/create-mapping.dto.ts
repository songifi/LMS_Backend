import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CoverageLevel } from '../entities/mapping.entity';

export class CreateMappingDto {
  @IsNotEmpty()
  @IsUUID()
  learningOutcomeId: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  assessmentId?: string;

  @IsEnum(CoverageLevel)
  coverageLevel: CoverageLevel;

  @IsOptional()
  @IsString()
  notes?: string;
}