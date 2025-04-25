import { IsUUID, IsNumber, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class CreateGradeDto {
  @IsUUID()
  submissionId: string;

  @IsNumber()
  score: number;

  @IsBoolean()
  @IsOptional()
  isAutoGraded?: boolean;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsUUID()
  @IsOptional()
  rubricId?: string;

  @IsObject()
  @IsOptional()
  rubricScores?: any;
}
