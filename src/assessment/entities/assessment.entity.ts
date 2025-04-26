import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Question } from './question.entity';
import { Submission } from './submission.entity';
import { User } from 'src/user/entities/user.entity';
import { AssessmentType } from '../enums/assessmentType.enum';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AssessmentType,
  })
  type: AssessmentType;

  @Column({ nullable: true })
  instructions: string;

  @Column({ default: 100 })
  totalPoints: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  allowLateSubmissions: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  startDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  timeLimit: number; // in minutes, if applicable

  @Column({ default: false })
  enablePlagiarismCheck: boolean;

  @Column({ default: 1 })
  maxAttempts: number;

  @ManyToOne(() => User)
  creator: User;

  @OneToMany(() => Question, question => question.assessment)
  questions: Question[];

  @OneToMany(() => Submission, submission => submission.assessment)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
