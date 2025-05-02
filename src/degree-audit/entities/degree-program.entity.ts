import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DegreeRequirement } from './degree-requirement.entity';

@Entity('degree_programs')
export class DegreeProgram {
  @ApiProperty({ description: 'Unique identifier for the degree program' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the degree program' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Department offering the degree' })
  @Column()
  department: string;

  @ApiProperty({ description: 'Type of degree (e.g., BS, BA, MS, PhD)' })
  @Column()
  degreeType: string;

  @ApiProperty({ description: 'Total credits required for graduation' })
  @Column('int')
  totalCreditsRequired: number;

  @ApiProperty({ description: 'Description of the degree program' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'When the degree program was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the degree program was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DegreeRequirement, requirement => requirement.degreeProgram)
  requirements: DegreeRequirement[];
}