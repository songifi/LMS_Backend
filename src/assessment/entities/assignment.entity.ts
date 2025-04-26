import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Assessment)
  @JoinColumn()
  assessment: Assessment;

  @Column({ default: true })
  allowFileSubmissions: boolean;

  @Column('simple-array', { nullable: true })
  allowedFileTypes: string[];

  @Column({ nullable: true })
  maxFileSize: number; // in MB
}
