import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_streaks')
export class ActivityStreak {
  @ApiProperty({ description: 'Unique identifier for the streak record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID who owns this streak' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'Current consecutive days of activity' })
  @Column({ default: 0 })
  currentStreak: number;

  @ApiProperty({ description: 'Longest streak achieved' })
  @Column({ default: 0 })
  longestStreak: number;

  @ApiProperty({ description: 'Date of last activity' })
  @Column({ type: 'timestamp' })
  lastActivityDate: Date;

  @ApiProperty({ description: 'Activity types contributing to this streak' })
  @Column({ type: 'jsonb', default: [] })
  activityTypes: string[];

  @ApiProperty({ description: 'Additional streak data' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the streak record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the streak record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}