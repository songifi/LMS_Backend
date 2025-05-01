import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusType } from '../entities/application-status.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'New status of the application', enum: StatusType })
  @IsEnum(StatusType)
  status: StatusType;

  @ApiPropertyOptional({ description: 'Notes about the status change' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'User who changed the status' })
  @IsString()
  @IsOptional()
  changedBy?: string;
}

export class ApplicationStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty({ enum: StatusType })
  status: StatusType;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  changedBy?: string;

  @ApiProperty()
  createdAt: Date;
}
