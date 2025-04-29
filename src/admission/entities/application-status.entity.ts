import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Application } from './application.entity';

export enum StatusType {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  DOCUMENTS_REQUIRED = 'documents_required',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_COMPLETED = 'payment_completed',
  REVIEW_COMPLETED = 'review_completed',
  DECISION_MADE = 'decision_made',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  DEFERRED = 'deferred',
  WITHDRAWN = 'withdrawn',
}

@Entity('application_statuses')
export class ApplicationStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, application => application.statusHistory)
  @JoinColumn()
  application: Application;

  @Column()
  applicationId: string;

  @Column({
    type: 'enum',
    enum: StatusType,
  })
  status: StatusType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
