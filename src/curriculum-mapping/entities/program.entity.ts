import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LearningOutcome } from './learning-outcome.entity';
import { Course } from './course.entity';

@Entity()
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => LearningOutcome, outcome => outcome.program)
  learningOutcomes: LearningOutcome[];

  @OneToMany(() => Course, course => course.program)
  courses: Course[];

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}