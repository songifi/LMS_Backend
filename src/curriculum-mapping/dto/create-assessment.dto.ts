import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { AssessmentType } from '../entities/assessment.entity';

export class CreateAssessmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}
