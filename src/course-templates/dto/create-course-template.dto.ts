import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContentBlockDto } from './create-content-block.dto';
import { CreateLearningOutcomeDto } from './create-learning-outcome.dto';
import { CreateAssessmentStructureDto } from './create-assessment-structure.dto';

export class CreateCourseTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsUUID()
  @IsOptional()
  parentTemplateId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentBlockDto)
  @IsOptional()
  contentBlocks?: CreateContentBlockDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLearningOutcomeDto)
  @IsOptional()
  learningOutcomes?: CreateLearningOutcomeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentStructureDto)
  @IsOptional()
  assessmentStructures?: CreateAssessmentStructureDto[];
}