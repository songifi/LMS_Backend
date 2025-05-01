import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateAssessmentStructureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  assessmentType: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  weightPercentage: number;

  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}
