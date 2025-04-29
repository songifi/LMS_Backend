import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Application } from './application.entity';
import { DocumentRequirement } from './document-requirement.entity';

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

  @Column({ nullable: true })
  verifiedBy: string | null;

  @Column({ nullable: true })
  verifiedAt: Date | null;

  @Column({ default: false })
  isRejected: boolean;

  @Column({ nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  uploadedAt: Date | null;
}