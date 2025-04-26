import { IsUUID, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  assessmentId: string;

  @IsObject()
  answers: any;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}