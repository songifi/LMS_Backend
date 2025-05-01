import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from './student.entity';

export enum PreferenceType {
  SUBJECT_PREFERENCE = 'subject_preference',
  SCHEDULE_PREFERENCE = 'schedule_preference',
  PROFESSOR_PREFERENCE = 'professor_preference',
  DIFFICULTY_PREFERENCE = 'difficulty_preference',
  CAREER_RELEVANCE = 'career_relevance',
}

@Entity('student_preferences')
export class StudentPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, student => student.preferences)
  student: Student;

  @Column({
    type: 'enum',
    enum: PreferenceType,
  })
  type: PreferenceType;

  @Column()
  key: string;

  @Column({ type: 'float' })
  weight: number;

  @Column({ type: 'json', nullable: true })
  additionalData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}