import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from './academic-program.entity';

@Entity('program_enrollments')
export class ProgramEnrollment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the enrollment' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @Column()
  @ApiProperty({ description: 'Enrollment status (Active, Graduated, Withdrawn)' })
  status: string;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'When the student enrolled in the program' })
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  @ApiProperty({ description: 'When the student completed the program' })
  completionDate: Date;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Progress tracking for degree requirements' })
  progressTracking: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Catalog year for this enrollment' })
  catalogYear: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Completed courses and grades' })
  completedCourses: Record<string, any>;

  @ManyToOne(() => Program, program => program.enrollments)
  @JoinColumn({ name: 'program_id' })
  @ApiProperty({ type: () => Program, description: 'Program the student is enrolled in' })
  program: Program;

  @Column()
  programId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the enrollment was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the enrollment was last updated' })
  updatedAt: Date;
}
