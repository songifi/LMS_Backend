import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLearningOutcomeDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsNotEmpty()
  sequenceOrder: number;

  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}
