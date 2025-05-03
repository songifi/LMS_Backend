import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { DataSource } from './data-source.entity';

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  HTML = 'html',
  JSON = 'json'
}

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONCE = 'once',
  CUSTOM = 'custom'
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'role_id', nullable: true })
  roleId: string;

  @Column({ type: 'jsonb' })
  query: Record<string, any>;
  
  @Column({ 
    type: 'enum', 
    enum: ReportFormat,
    default: ReportFormat.PDF,
    array: true
  })
  formats: ReportFormat[];

  @ManyToOne(() => DataSource)
  @JoinColumn({ name: 'data_source_id' })
  dataSource: DataSource;
  
  @Column({ name: 'data_source_id' })
  dataSourceId: string;

  @Column({ 
    type: 'enum', 
    enum: ReportFrequency,
    default: ReportFrequency.ONCE
  })
  frequency: ReportFrequency;

  @Column({ name: 'cron_expression', nullable: true })
  cronExpression: string;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
  nextRunAt: Date;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  recipients: { email: string; name?: string }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  template: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
