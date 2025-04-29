import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('leaderboards')
export class Leaderboard {
  @ApiProperty({ description: 'Unique identifier for the leaderboard entry' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the leaderboard' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Period for this leaderboard (daily, weekly, monthly, all-time)' })
  @Column()
  period: string;

  @ApiProperty({ description: 'Start date for this leaderboard period' })
  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @ApiProperty({ description: 'End date for this leaderboard period' })
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ApiProperty({ description: 'Leaderboard entries in JSON format' })
  @Column({ type: 'jsonb' })
  entries: Record<string, any>[];

  @ApiProperty({ description: 'When the leaderboard was last updated' })
  @CreateDateColumn()
  updatedAt: Date;
}