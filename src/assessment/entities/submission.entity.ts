import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn } from 'typeorm';
import { Assessment } from './assessment.entity';
import { User } from 'src/user/entities/user.entity';
import { Grade } from './grade.entity';
import { SubmissionStatus } from '../enums/submissionStatus.enum';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Assessment, assessment => assessment.submissions)
  assessment: Assessment;

  @ManyToOne(() => User)
  student: User;

  @Column('json')
  answers: any;

  @Column({ nullable: true })
  fileUrl: string; // For assignment submissions with files

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus;

  @Column({ default: 0 })
  attemptNumber: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ default: 0 })
  plagiarismScore: number;

  @OneToOne(() => Grade, grade => grade.submission)
  grade: Grade;

  @CreateDateColumn()
  submittedAt: Date;
}