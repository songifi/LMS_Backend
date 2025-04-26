import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';
import { User } from 'src/user/entities/user.entity';
import { GradingRubric } from './grading-rubric.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Submission, submission => submission.grade)
  @JoinColumn()
  submission: Submission;

  @Column('float')
  score: number;

  @Column({ default: false })
  isAutoGraded: boolean;

  @Column('text', { nullable: true })
  feedback: string | null;

  @ManyToOne(() => User, { nullable: true })
  gradedBy: User | null;

  @ManyToOne(() => GradingRubric, { nullable: true })
  rubric: GradingRubric | null;

  @Column('json', { nullable: true })
  rubricScores: any | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
