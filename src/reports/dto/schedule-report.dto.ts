import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';

export class ScheduleReportDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Template ID to schedule' })
  templateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name for this schedule' })
  name: string;

  @IsObject()
  @ApiProperty({ description: 'Parameters for the report' })
  parameters: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Cron expression for scheduling' })
  cronExpression: string;

  @IsObject()
  @ApiProperty({ description: 'How to deliver the report' })
  deliveryConfig: {
    type: string;
    recipients: string[];
    format: string;
    additionalConfig?: Record<string, any>;
  };
}
