import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Submission } from './submission.entity';
import { Feedback } from './feedback.entity';

@Entity('grading_history')
export class GradingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submissionId: string;

  @Column()
  feedbackId: string;

  @Column({ type: 'float' })
  totalScore: number;

  @Column()
  gradedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @ManyToOne(() => Feedback)
  @JoinColumn({ name: 'feedbackId' })
  feedback: Feedback;
}