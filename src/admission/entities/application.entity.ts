import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { ApplicationDocument } from './application-document.entity';
import { ApplicationReview } from './application-review.entity';
import { ApplicationStatus } from './application-status.entity';
import { ApplicationForm } from './application-form.entity';
import { ApplicationFee } from './application-fee.entity';
import { ApplicationCommunication } from './application-communication.entity';

export enum ApplicationDecision {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  DEFERRED = 'deferred',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicantId: string;

  @Column()
  programId: string;

  @Column({ type: 'jsonb' })
  formData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ApplicationDecision,
    default: ApplicationDecision.PENDING,
  })
  decision: ApplicationDecision;

  @Column({ nullable: true })
  decisionDate: Date;

  @Column({ nullable: true })
  decisionBy: string;

  @Column({ nullable: true })
  decisionNotes: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isSubmitted: boolean;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true, unique: true })
  publicAccessToken: string;

  @ManyToOne(() => ApplicationForm)
  @JoinColumn()
  form: ApplicationForm;

  @Column()
  formId: string;

  @OneToMany(() => ApplicationDocument, document => document.application)
  documents: ApplicationDocument[];

  @OneToMany(() => ApplicationReview, review => review.application)
  reviews: ApplicationReview[];

  @OneToMany(() => ApplicationStatus, status => status.application)
  statusHistory: ApplicationStatus[];

  @OneToMany(() => ApplicationFee, fee => fee.application)
  fees: ApplicationFee[];

  @OneToMany(() => ApplicationCommunication, communication => communication.application)
  communications: ApplicationCommunication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
