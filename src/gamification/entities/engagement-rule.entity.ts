import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '../interfaces/gamification.interfaces';

@Entity('engagement_rules')
export class EngagementRule {
  @ApiProperty({ description: 'Unique identifier for the engagement rule' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Activity type this rule applies to' })
  @Column({ type: 'enum', enum: ActivityType })
  activityType: ActivityType;

  @ApiProperty({ description: 'Base points for this activity' })
  @Column()
  basePoints: number;

  @ApiProperty({ description: 'Maximum points possible for this activity' })
  @Column({ default: 0 })
  maxPoints: number;

  @ApiProperty({ description: 'Multiplier for streaks and bonuses' })
  @Column({ type: 'float', default: 1.0 })
  multiplier: number;

  @ApiProperty({ description: 'Daily limit for this activity' })
  @Column({ default: 0 })
  dailyLimit: number;

  @ApiProperty({ description: 'Calculation rules in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  calculationRules: Record<string, any>;
}
