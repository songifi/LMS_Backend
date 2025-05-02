import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Mapping } from './mapping.entity';

export enum AssessmentType {
  EXAM = 'exam',
  PROJECT = 'project',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  PRESENTATION = 'presentation',
  OTHER = 'other',
}

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.ASSIGNMENT
  })
  type: AssessmentType;

  @Column()
  weight: number;

  @ManyToOne(() => Course, course => course.assessments)
  course: Course;

  @OneToMany(() => Mapping, mapping => mapping.assessment)
  mappings: Mapping[];

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}