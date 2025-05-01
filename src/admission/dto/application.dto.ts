import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsBoolean, IsOptional, IsDateString, IsEnum, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationDecision } from '../entities/application.entity';

export class CreateApplicationDto {
  @ApiProperty({ description: 'The ID of the applicant' })
  @IsString()
  @IsNotEmpty()
  applicantId: string;

  @ApiProperty({ description: 'The ID of the program' })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ description: 'The ID of the application form' })
  @IsUUID()
  formId: string;

  @ApiProperty({ description: 'The form data as JSON' })
  @IsObject()
  formData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the application is submitted' })
  @IsBoolean()
  @IsOptional()
  isSubmitted?: boolean;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ description: 'Form data to update' })
  @IsObject()
  @IsOptional()
  formData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the application is completed' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Whether the application is submitted' })
  @IsBoolean()
  @IsOptional()
  isSubmitted?: boolean;

  @ApiPropertyOptional({ description: 'Submission date and time' })
  @IsDateString()
  @IsOptional()
  submittedAt?: Date;
}

export class ApplicationDecisionDto {
  @ApiProperty({ description: 'The decision on the application', enum: ApplicationDecision })
  @IsEnum(ApplicationDecision)
  decision: ApplicationDecision;

  @ApiProperty({ description: 'Notes about the decision' })
  @IsString()
  decisionNotes: string;
}

export class ApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicantId: string;

  @ApiProperty()
  programId: string;

  @ApiProperty()
  formId: string;

  @ApiProperty()
  formData: Record<string, any>;

  @ApiProperty({ enum: ApplicationDecision })
  decision: ApplicationDecision;

  @ApiPropertyOptional()
  decisionDate?: Date;

  @ApiPropertyOptional()
  decisionBy?: string;

  @ApiPropertyOptional()
  decisionNotes?: string;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isSubmitted: boolean;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiPropertyOptional()
  publicAccessToken?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ApplicationPaginatedResponseDto {
  @ApiProperty({ type: [ApplicationResponseDto] })
  items: ApplicationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
