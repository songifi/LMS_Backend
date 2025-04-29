import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RewardType } from '../interfaces/gamification.interfaces';

@Entity('rewards')
export class Reward {
  @ApiProperty({ description: 'Unique identifier for the reward' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the reward' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the reward' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Type of reward' })
  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @ApiProperty({ description: 'Points required to redeem this reward' })
  @Column()
  pointsCost: number;

  @ApiProperty({ description: 'Requirements to unlock this reward in JSON format' })
  @Column({ type: 'jsonb', nullable: true })
  unlockRequirements: Record<string, any>;

  @ApiProperty({ description: 'Image URL for the reward' })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'When the reward was created' })
  @CreateDateColumn()
  createdAt: Date;
}