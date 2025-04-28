import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsMetric } from './analytics.entity';

@Entity()
export class AnalyticsDatapoint {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the datapoint' })
  id: string;

  @ManyToOne(() => AnalyticsMetric, metric => metric.datapoints)
  @ApiProperty({ description: 'Metric this datapoint belongs to' })
  metric: AnalyticsMetric;

  @Column('uuid', { nullable: true })
  @ApiProperty({ description: 'Entity ID this datapoint relates to (course ID, user ID, etc.)' })
  entityId: string;

  @Column('float')
  @ApiProperty({ description: 'Value of the datapoint' })
  value: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'When this datapoint was recorded' })
  timestamp: Date;

  @Column('jsonb', { nullable: true })
  @ApiProperty({ description: 'Additional metadata for this datapoint' })
  metadata: Record<string, any>;
}
