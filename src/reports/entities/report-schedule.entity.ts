import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReportTemplate } from './report-template.entity';

@Entity()
export class ReportSchedule {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the schedule' })
  id: string;

  @ManyToOne(() => ReportTemplate, template => template.schedules)
  @ApiProperty({ type: () => ReportTemplate, description: 'Report template to be scheduled' })
  template: ReportTemplate;

  @Column('uuid')
  @ApiProperty({ description: 'User ID who created the schedule' })
  userId: string;

  @Column()
  @ApiProperty({ description: 'Name of the schedule' })
  name: string;

  @Column('jsonb')
  @ApiProperty({ description: 'Parameters for the scheduled report' })
  parameters: Record<string, any>;

  @Column()
  @ApiProperty({ description: 'Cron expression for the schedule' })
  cronExpression: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the schedule is active' })
  isActive: boolean;

  @Column('jsonb')
  @ApiProperty({ description: 'Delivery configuration for the generated reports' })
  deliveryConfig: {
    type: string; // email, slack, webhook, etc.
    recipients: string[];
    format: string; // pdf, excel, csv, etc.
    additionalConfig?: Record<string, any>;
  };
}
