import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Template ID to use for this report' })
  templateId: string;

  @IsObject()
  @ApiProperty({ description: 'Parameters for the report' })
  parameters: Record<string, any>;

  @IsOptional()
  @ApiProperty({ description: 'Name to give to this report', required: false })
  name?: string;
}