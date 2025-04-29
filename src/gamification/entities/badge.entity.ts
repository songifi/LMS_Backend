import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BadgeType } from '../interfaces/gamification.interfaces';

@Entity('badges')
export class Badge {
  @ApiProperty({ description: 'Unique identifier for the badge' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the badge' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of how to earn the badge' })
  @Column()
  description: string;

  @ApiProperty({ description: 'URL to the badge image' })
  @Column()
  imageUrl: string;

  @ApiProperty({ description: 'Type of badge' })
  @Column({ type: 'enum', enum: BadgeType })
  type: BadgeType;

  @ApiProperty({ description: 'Requirements to earn this badge in JSON format' })
  @Column({ type: 'jsonb' })
  requirements: Record<string, any>;

  @ApiProperty({ description: 'Points awarded when earning this badge' })
  @Column({ default: 0 })
  pointsValue: number;
}
