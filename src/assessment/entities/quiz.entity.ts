import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Assessment)
  @JoinColumn()
  assessment: Assessment;

  @Column({ default: false })
  randomizeQuestions: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean;

  @Column({ default: false })
  showFeedbackImmediately: boolean;
}
