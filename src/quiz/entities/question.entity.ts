import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { QuestionType } from '../interfaces/question-types.interface';
import { DifficultyMetrics } from '../interfaces/difficulty.interface';
import { Tag } from './tag.entity';
import { Category } from './category.entity';
import { QuestionVersion } from './question-version.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('jsonb')
  difficultyMetrics: DifficultyMetrics;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'question_tags',
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'question_categories',
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @OneToMany(() => QuestionVersion, version => version.question)
  versions: QuestionVersion[];

  @Column('int', { default: 1 })
  currentVersion: number;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  parentQuestionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column('int', { default: 0 })
  usageCount: number;

  @Column('int', { default: 0 })
  correctCount: number;

  @Column('int', { default: 0 })
  incorrectCount: number;

  @Column('float', { default: 0 })
  averageTimeSpent: number;

  @Column('float', { default: 0 })
  discriminationIndex: number;
}