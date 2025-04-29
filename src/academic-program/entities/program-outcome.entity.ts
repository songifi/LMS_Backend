import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from './academic-program.entity';

@Entity('program_outcomes')
export class ProgramOutcome {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the program outcome' })
  id: string;

  @Column({ length: 200 })
  @ApiProperty({ description: 'Description of the program outcome' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Code for this outcome (e.g., PLO1)' })
  code: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Assessment methods for this outcome' })
  assessmentMethods: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  @ApiProperty({ description: 'Courses that contribute to this outcome' })
  relatedCourses: string[];

  @ManyToOne(() => Program, program => program.outcomes)
  @JoinColumn({ name: 'program_id' })
  @ApiProperty({ type: () => Program, description: 'Program this outcome belongs to' })
  program: Program;

  @Column()
  programId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the outcome was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the outcome was last updated' })
  updatedAt: Date;
}