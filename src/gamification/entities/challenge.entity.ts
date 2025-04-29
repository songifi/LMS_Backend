import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeStatus, ChallengeType } from '../interfaces/gamification.interfaces';

@Entity('challenges')
export class Challenge {
  @ApiProperty({ description: 'Unique identifier for the challenge' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the challenge' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the challenge' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Type of challenge' })
  @Column({ type: 'enum', enum: ChallengeType })
  type: ChallengeType;

  @ApiProperty({ description: 'Requirements to complete this challenge in JSON format' })
  @Column({ type: 'jsonb' })
  requirements: Record<string, any>;

  @ApiProperty({ description: 'Points awarded when completing this challenge' })
  @Column()
  pointsReward: number;

  @ApiProperty({ description: 'Badge ID awarded when completing this challenge' })
  @Column({ nullable: true })
  badgeRewardId: number;

  @ApiProperty({ description: 'Start date for this challenge' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'End date for this challenge' })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({ description: 'When the challenge was created' })
  @CreateDateColumn()
  createdAt: Date;
}