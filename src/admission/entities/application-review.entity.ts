import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Application } from './application.entity';

export enum ReviewDecision {
  RECOMMEND_ACCEPT = 'recommend_accept',
  RECOMMEND_REJECT = 'recommend_reject',
  RECOMMEND_WAITLIST = 'recommend_waitlist',
  NEED_MORE_INFO = 'need_more_info',
  NO_DECISION = 'no_decision',
}

@Entity('application_reviews')
export class ApplicationReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, application => application.reviews)
  @JoinColumn()
  application: Application;

  @Column()
  applicationId: string;

  @Column()
  reviewerId: string;

  @Column()
  reviewerName: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'jsonb', nullable: true })
  scores: Record<string, number>;

  @Column({
    type: 'enum',
    enum: ReviewDecision,
    default: ReviewDecision.NO_DECISION,
  })
  decision: ReviewDecision;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}