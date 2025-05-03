import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { QuestionType } from '../interfaces/question-types.interface';

@Entity('question_versions')
export class QuestionVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: string;

  @Column('int')
  versionNumber: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column('jsonb')
  content: any;

  @Column('jsonb', { nullable: true })
  conditionalLogic: any;

  @Column('jsonb', { nullable: true })
  difficultyMetrics: any;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('text', { nullable: true })
  changeNotes: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}