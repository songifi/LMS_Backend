import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApplicationForm } from './application-form.entity';

@Entity('document_requirements')
export class DocumentRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ApplicationForm)
  @JoinColumn()
  form: ApplicationForm;

  @Column()
  formId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedFileTypes: string[];

  @Column({ default: 10 })
  maxFileSizeMB: number;

  @Column({ default: 1 })
  maxFiles: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}