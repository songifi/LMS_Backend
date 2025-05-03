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

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('etl_jobs')
export class EtlJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => DataSource)
  @JoinColumn({ name: 'data_source_id' })
  dataSource: DataSource;
  
  @Column({ name: 'data_source_id' })
  dataSourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'extract_query', type: 'text', nullable: true })
  extractQuery: string;

  @Column({ name: 'transform_script', type: 'text', nullable: true })
  transformScript: string;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;

  @Column({ name: 'cron_expression', nullable: true })
  cronExpression: string;

  @Column({ 
    type: 'enum', 
    enum: JobStatus,
    default: JobStatus.PENDING
  })
  status: JobStatus;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt: Date;
  
  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
  nextRunAt: Date;

  @Column({ name: 'last_run_duration', type: 'integer', nullable: true })
  lastRunDuration: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
