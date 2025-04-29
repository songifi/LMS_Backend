import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommunicationStatus, CommunicationType } from '../entities/application-communication.entity';

export class UpdateCommunicationDto {
  @IsEnum(CommunicationType)
  @IsOptional()
  type?: CommunicationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  recipientAddress?: string;

  @IsEnum(CommunicationStatus)
  @IsOptional()
  status?: CommunicationStatus;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}