import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Application } from './application.entity';
import { DocumentRequirement } from './document-requirement.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('application_documents')
export class ApplicationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, application => application.documents)
  @JoinColumn()
  application: Application;

  @Column()
  applicationId: string;

  @ManyToOne(() => DocumentRequirement)
  @JoinColumn()
  requirement: DocumentRequirement;

  @Column()
  requirementId: string;

  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column()
  storagePath: string;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => User)
  verifiedBy: User;
  

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ default: false })
  isRejected: boolean;

  @Column('jsonb', { nullable: true })
  rejectionReason: object;

  @CreateDateColumn()
  uploadedAt: Date | null;
}