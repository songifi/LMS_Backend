import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { StudentPreference } from './student-preference.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  major: string;

  @Column({ nullable: true })
  minor: string;

  @Column({ type: 'int', default: 1 })
  year: number;

  @Column({ nullable: true })
  careerGoal: string;

  @Column({ type: 'json', nullable: true })
  interests: string[];

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => StudentPreference, preference => preference.student)
  preferences: StudentPreference[];

  @ManyToMany(() => Course)
  @JoinTable({
    name: 'student_saved_courses',
    joinColumn: { name: 'student_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' },
  })
  savedCourses: Course[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}