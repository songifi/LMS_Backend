import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn
} from 'typeorm';

export enum DataSourceType {
  LMS = 'lms',
  STUDENT_INFO = 'student_info',
  ENROLLMENT = 'enrollment',
  ASSESSMENT = 'assessment',
  FINANCIAL = 'financial',
  CUSTOM = 'custom'
}

@Entity('data_sources')
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: DataSourceType,
    default: DataSourceType.LMS
  })
  type: DataSourceType;

  @Column({ name: 'connection_string', type: 'text', nullable: true })
  connectionString: string;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  schema: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
