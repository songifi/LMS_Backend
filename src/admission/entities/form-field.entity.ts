import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApplicationForm } from './application-form.entity';

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
}

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ApplicationForm, form => form.fields)
  @JoinColumn()
  form: ApplicationForm;

  @Column()
  formId: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FieldType,
  })
  type: FieldType;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'jsonb', nullable: true })
  validations: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  options: any[];

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}