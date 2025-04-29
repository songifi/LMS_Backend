import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('points')
export class Point {
  @ApiProperty({ description: 'Unique identifier for the points record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID who earned the points' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'Amount of points earned' })
  @Column()
  amount: number;

  @ApiProperty({ description: 'Activity that generated these points' })
  @Column()
  activityType: string;

  @ApiProperty({ description: 'Reference to the specific activity' })
  @Column({ nullable: true })
  activityId: number;

  @ApiProperty({ description: 'Additional metadata about the points' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the points were earned' })
  @CreateDateColumn()
  createdAt: Date;
}
