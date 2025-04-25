import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
// import { Course } from '../../course/entities/course.entity';
// import { Student } from '../../student/entities/student.entity';
import { CourseEnrollment } from './course-enrollment.entity';

@Entity('course_progress')
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  enrollmentId: string;

  @Column()
  studentId: string;

  @Column()
  courseId: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  percentComplete: number;

  @Column()
  lastActivityDate: Date;

  @Column({ default: 0 })
  activitiesCompleted: number;

  @Column()
  totalActivities: number;

  @Column()
  deadline: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => CourseEnrollment)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: CourseEnrollment;

//   @ManyToOne(() => Student)
//   @JoinColumn({ name: 'studentId' })
//   student: Student;

//   @ManyToOne(() => Course)
//   @JoinColumn({ name: 'courseId' })
//   course: Course;
}
