import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';

@Entity('course_sessions')
export class CourseSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  location: string;

  @Column()
  instructorId: string;

  @Column()
  maxCapacity: number;

  @Column('simple-array', { nullable: true })
  materials: string[];

//   @ManyToOne(() => Course)
//   @JoinColumn({ name: 'courseId' })
//   course: Course;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor: User;
}