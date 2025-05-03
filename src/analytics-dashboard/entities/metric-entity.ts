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

export enum MetricType {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  CUSTOM = 'custom'
}

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: MetricType,
    default: MetricType.COUNT
  })
  type: MetricType;

  @Column({ type: 'text', nullable: true })
  formula: string;

  @Column({ name: 'sql_query', type: 'text', nullable: true })
  sqlQuery: string;

  @ManyToOne(() => DataSource)
  @JoinColumn({ name: 'data_source_id' })
  dataSource: DataSource;
  
  @Column({ name: 'data_source_id' })
  dataSourceId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
