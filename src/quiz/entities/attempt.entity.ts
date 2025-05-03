import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity('attempts')
export class Attempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Assessment)
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessment;

  @Column()
  assessmentId: string;

  @Column('jsonb')
  questionResponses: {
    questionId: string;
    response: any;
    correct: boolean;
    partialScore?: number;
    timeSpent: number;
    hintUsed: boolean;
    skipped: boolean;
  }[];

  @Column('float')
  totalScore: number;

  @Column('float')
  percentageScore: number;

  @Column('boolean')
  passed: boolean;

  @Column('int')
  totalTimeSpent: number; // in seconds

  @Column('timestamp')
  startedAt: Date;

  @Column('timestamp', { nullable: true })
  completedAt: Date;

  @Column({
    type: 'enum',
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIMED_OUT'],
    default: 'IN_PROGRESS',
  })
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';

  @Column('jsonb', { nullable: true })
  feedback: {
    overall?: string;
    byQuestion?: {
      questionId: string;
      feedback: string;
    }[];
  };

  @Column('int', { default: 1 })
  attemptNumber: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}