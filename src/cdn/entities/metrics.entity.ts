import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('cdn_metrics')
export class MetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  timestamp: Date;

  @Column({ nullable: true })
  @Index()
  assetId?: string;

  @Column({ nullable: true })
  @Index()
  edgeNodeId?: string;

  @Column({ nullable: true })
  @Index()
  studentId?: string;

  @Column({ nullable: true })
  region?: string;

  @Column()
  metricType: 'latency' | 'error' | 'cache_hit' | 'cache_miss' | 'bandwidth' | 'load_time';

  @Column('float')
  value: number;

  @Column('jsonb', { default: {} })
  additionalData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}