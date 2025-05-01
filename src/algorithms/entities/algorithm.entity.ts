import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AlgorithmStatus {
  ACTIVE = 'active',
  TESTING = 'testing',
  INACTIVE = 'inactive',
}

@Entity('algorithms')
export class Algorithm {
  @ApiProperty({ description: 'Unique identifier for the algorithm' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the algorithm' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the algorithm' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Type of the algorithm' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Configuration parameters (JSON)' })
  @Column('jsonb')
  parameters: Record<string, any>;

  @ApiProperty({ description: 'Weight factors for different recommendation criteria (JSON)' })
  @Column('jsonb')
  weights: Record<string, number>;

  @ApiProperty({ description: 'Version number' })
  @Column()
  version: string;

  @ApiProperty({ description: 'Current status of the algorithm' })
  @Column({
    type: 'enum',
    enum: AlgorithmStatus,
    default: AlgorithmStatus.TESTING,
  })
  status: AlgorithmStatus;

  @ApiProperty({ description: 'Performance metrics (JSON)' })
  @Column('jsonb', { nullable: true })
  metrics: Record<string, any>;

  @ApiProperty({ description: 'When the algorithm was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the algorithm was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}