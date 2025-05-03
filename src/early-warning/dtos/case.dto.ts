import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CasePriority, CaseStatus, TriggerType } from '../entities/case.entity';

class NoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

class TimelineEntryDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  description: string;
}

class OutcomeDto {
  @IsBoolean()
  successful: boolean;

  @IsObject()
  improvements: Record<string, number>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCaseDto {
  @IsMongoId()
  student: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  triggeringIndicators?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  recommendedInterventions?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  appliedInterventions?: string[];

  @IsMongoId()
  @IsOptional()
  assignedTo?: string;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NoteDto)
  note?: NoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimelineEntryDto)
  timelineEntry?: TimelineEntryDto;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @IsOptional()
  followUpDate?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  requiresParentalConsent?: boolean;

  @IsBoolean()
  @IsOptional()
  parentalConsentObtained?: boolean;
}

export class UpdateCaseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  recommendedInterventions?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  appliedInterventions?: string[];

  @IsMongoId()
  @IsOptional()
  assignedTo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NoteDto)
  note?: NoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimelineEntryDto)
  timelineEntry?: TimelineEntryDto;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @IsOptional()
  followUpDate?: Date;

  @IsDate()
  @IsOptional()
  closedDate?: Date;

  @IsString()
  @IsOptional()
  closureReason?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OutcomeDto)
  outcome?: OutcomeDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  requiresParentalConsent?: boolean;

  @IsBoolean()
  @IsOptional()
  parentalConsentObtained?: boolean;
}