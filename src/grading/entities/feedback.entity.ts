import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Submission } from './submission.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submissionId: string;

  @Column('text', { nullable: true })
  overallFeedback: string;

  @Column('json')
  criteriaScores: Record<string, number>;

  @Column('json', { nullable: true })
  comments: Record<string, string>;

  @Column({ type: 'float' })
  totalScore: number;

  @Column()
  gradedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Submission, submission => submission.feedback)
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;
}