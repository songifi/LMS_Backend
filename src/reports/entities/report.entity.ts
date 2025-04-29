import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReportTemplate } from './report-template.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the report' })
  id: string;

  @ManyToOne(() => ReportTemplate, template => template.reports)
  @ApiProperty({ type: () => ReportTemplate, description: 'Template used to generate this report' })
  template: ReportTemplate;

  @Column('uuid', { nullable: true })
  @ApiProperty({ description: 'User ID who generated the report', required: false })
  userId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the report was generated' })
  generatedAt: Date;

  @Column('jsonb')
  @ApiProperty({ description: 'Parameters used to generate this report' })
  parameters: Record<string, any>;

  @Column('jsonb')
  @ApiProperty({ description: 'Data for the report' })
  data: Record<string, any>;
}
