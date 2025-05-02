import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from '../../courses/entities/course.entity';

export enum EnrollmentStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  PLANNED = 'planned',
  DROPPED = 'dropped',
}

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, student => student.enrollments)
  student: Student;

  @ManyToOne(() => Course, course => course.enrollments)
  course: Course;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PLANNED,
  })
  status: EnrollmentStatus;

  @Column({ nullable: true, type: 'character' })
  grade: string;
  
  @Column({ nullable: true })
  semester: string;
  
  @Column({ nullable: true })
  year: number;

  @CreateDateColumn()
  createdAt: Date;
}