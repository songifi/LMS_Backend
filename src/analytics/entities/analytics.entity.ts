import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsDatapoint } from './analytics-datapoint.entity';

@Entity()
export class AnalyticsMetric {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the metric' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Name of the metric' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Description of what the metric measures' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Unit of measurement for the metric' })
  unit: string;

  @Column()
  @ApiProperty({ description: 'Type of entity this metric is related to (course, user, system)' })
  entityType: string;

  @OneToMany(() => AnalyticsDatapoint, datapoint => datapoint.metric)
  datapoints: AnalyticsDatapoint[];
}