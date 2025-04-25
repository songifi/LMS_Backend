import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';
// import { Student } from '../../student/entities/student.entity';
// import { Course } from '../../course/entities/course.entity';

@Entity('course_enrollments')
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  courseId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status: EnrollmentStatus;

  @CreateDateColumn()
  enrollmentDate: Date;

  @Column()
  enrollmentDeadline: Date;

  @Column({ nullable: true })
  completionDate: Date;

  @Column({ default: true })
  isActive: boolean;

//   @ManyToOne(() => Student)
//   @JoinColumn({ name: 'studentId' })
//   student: Student;

//   @ManyToOne(() => Course)
//   @JoinColumn({ name: 'courseId' })
//   course: Course;
}