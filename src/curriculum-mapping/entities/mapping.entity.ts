import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LearningOutcome } from './learning-outcome.entity';
import { Course } from './course.entity';
import { Assessment } from './assessment.entity';

export enum CoverageLevel {
  INTRODUCED = 'introduced',
  REINFORCED = 'reinforced',
  MASTERED = 'mastered',
}

@Entity()
export class Mapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LearningOutcome, outcome => outcome.mappings)
  learningOutcome: LearningOutcome;

  @ManyToOne(() => Course, course => course.mappings, { nullable: true })
  course: Course;

  @ManyToOne(() => Assessment, assessment => assessment.mappings, { nullable: true })
  assessment: Assessment;

  @Column({
    type: 'enum',
    enum: CoverageLevel,
    default: CoverageLevel.INTRODUCED
  })
  coverageLevel: CoverageLevel;

  @Column({ nullable: true })
  notes: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}