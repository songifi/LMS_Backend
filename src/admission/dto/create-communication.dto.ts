import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CommunicationType } from '../entities/application-communication.entity';

export class CreateCommunicationDto {
  @IsUUID()
  @IsNotEmpty()
  applicationId: string;

  @IsEnum(CommunicationType)
  @IsNotEmpty()
  type: CommunicationType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  recipientAddress?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}