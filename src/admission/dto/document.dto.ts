import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsPositive } from 'class-validator';

export class CreateDocumentRequirementDto {
  @ApiProperty({ description: 'The form ID this requirement belongs to' })
  @IsUUID()
  formId: string;

  @ApiProperty({ description: 'Name of the document requirement' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the document requirement' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Is this document required?' })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Allowed file types', example: ['pdf', 'jpg', 'png'] })
  @IsArray()
  @IsOptional()
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ description: 'Maximum file size in MB' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxFileSizeMB?: number;

  @ApiPropertyOptional({ description: 'Maximum number of files allowed' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxFiles?: number;
}

export class DocumentVerificationDto {
  @ApiProperty({ description: 'Is the document verified?' })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Rejection reason if not verified' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ApplicationDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  requirementId: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalFilename: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  verifiedBy?: string;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiProperty()
  isRejected: boolean;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  uploadedAt: Date;
}