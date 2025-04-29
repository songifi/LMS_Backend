import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Curriculum } from './curriculum.entity';
import { Requirement } from './requirement.entity';
import { ProgramOutcome } from './program-outcome.entity';
import { ProgramEnrollment } from './program-enrollment.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the program' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Name of the academic program' })
  name: string;

  @Column({ length: 10 })
  @ApiProperty({ description: 'Program code (e.g., CS, BIO)' })
  code: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Program description' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Credits required for completion' })
  requiredCredits: number;

  @Column({ default: true })
  @ApiProperty({ description: 'Program active status' })
  isActive: boolean;

  @Column({ length: 50 })
  @ApiProperty({ description: 'Department that manages the program' })
  department: string;

  @Column({ length: 50 })
  @ApiProperty({ description: 'Degree level (Bachelors, Masters, etc.)' })
  degreeLevel: string;

  @OneToMany(() => Curriculum, curriculum => curriculum.program)
  @ApiProperty({ type: () => [Curriculum], description: 'Curricula associated with this program' })
  curricula: Curriculum[];

  @OneToMany(() => Requirement, requirement => requirement.program)
  @ApiProperty({ type: () => [Requirement], description: 'Requirements for this program' })
  requirements: Requirement[];

  @OneToMany(() => ProgramOutcome, outcome => outcome.program)
  @ApiProperty({ type: () => [ProgramOutcome], description: 'Learning outcomes for this program' })
  outcomes: ProgramOutcome[];

  @OneToMany(() => ProgramEnrollment, enrollment => enrollment.program)
  @ApiProperty({ type: () => [ProgramEnrollment], description: 'Student enrollments in this program' })
  enrollments: ProgramEnrollment[];

  @CreateDateColumn()
  @ApiProperty({ description: 'When the program was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the program was last updated' })
  updatedAt: Date;
}