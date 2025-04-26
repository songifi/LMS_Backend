import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Assessment } from './assessment.entity';
import { QuestionType } from '../enums/questionType.enum';
import { QuestionBank } from './question-bank.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  options: any; 

  @Column('json', { nullable: true })
  correctAnswer: any;

  @Column({ default: 1 })
  points: number;

  @Column({ default: '' })
  explanation: string;

  @Column({ default: false })
  isRequired: boolean;

  @ManyToOne(() => Assessment, assessment => assessment.questions)
  assessment: Assessment;

  @ManyToOne(() => QuestionBank, questionBank => questionBank.questions, { nullable: true })
  questionBank: QuestionBank | null;
  
}
