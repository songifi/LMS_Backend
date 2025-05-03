import { IsString, IsOptional, IsObject } from 'class-validator';

export class StartAttemptDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}