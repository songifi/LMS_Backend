import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PrivacyLevel } from '../entities/student.entity';

class MetricsDto {
  @IsOptional()
  attendance?: number;

  @IsOptional()
  assignmentCompletion?: number;

  @IsOptional()
  gradeAverage?: number;

  @IsOptional()
  engagementScore?: number;

  @IsOptional()
  behaviorIncidents?: number;

  @IsOptional()
  [key: string]: any;
}

class PrivacySettingsDto {
  @IsEnum(PrivacyLevel)
  @IsOptional()
  demographics?: PrivacyLevel;

  @IsEnum(PrivacyLevel)
  @IsOptional()
  cases?: PrivacyLevel;

  @IsEnum(PrivacyLevel)
  @IsOptional()
  riskScores?: PrivacyLevel;

  @IsEnum(PrivacyLevel)
  @IsOptional()
  metrics?: PrivacyLevel;

  @IsOptional()
  [key: string]: PrivacyLevel;
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  classGroup?: string;

  @IsString({ each: true })
  @IsOptional()
  courses?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsDto)
  metrics?: MetricsDto;

  @IsObject()
  @IsOptional()
  demographics?: Record<string, any>;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  classGroup?: string;

  @IsString({ each: true })
  @IsOptional()
  courses?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsDto)
  metrics?: MetricsDto;

  @IsObject()
  @IsOptional()
  demographics?: Record<string, any>;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;
}