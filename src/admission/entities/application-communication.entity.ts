import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Application } from './application.entity';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  PORTAL_NOTIFICATION = 'portal_notification',
  LETTER = 'letter',
}

export enum CommunicationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('application_communications')
export class ApplicationCommunication {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Application, application => application.communications)
  @JoinColumn()
  application: Application;

  @Column()
  applicationId: string;

  @Column({ type: 'enum', enum: CommunicationType })
  type: CommunicationType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  recipientAddress: string;

  @Column({ type: 'enum', enum: CommunicationStatus, default: CommunicationStatus.PENDING })
  status: CommunicationStatus;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  templateId: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
