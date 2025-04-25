import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CourseSession } from './course-session.entity';
import { User } from '../../user/entities/user.entity';
import { AttendanceStatus } from '../enums/attendanceStatus.enum';

@Entity('course_attendance')
export class CourseAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  studentId: string;

  @Column()
  courseId: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn()
  recordedAt: Date;

  @Column({ nullable: true })
  justification: string;

  @ManyToOne(() => CourseSession)
  @JoinColumn({ name: 'sessionId' })
  session: CourseSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedBy' })
  recorder: User;

  @Column()
  recordedBy: string; // Optional: only if you need the ID separately in queries
}
