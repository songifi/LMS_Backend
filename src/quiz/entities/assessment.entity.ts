import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { Attempt } from './attempt.entity';
import { Tag } from './tag.entity';
import { Category } from './category.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column('jsonb', { nullable: true })
  instructions: {
    before?: string;
    during?: string;
    after?: string;
  };

  @Column('int')
  timeLimit: number; // in minutes, 0 for unlimited

  @ManyToMany(() => Question)
  @JoinTable({
    name: 'assessment_questions',
    joinColumn: { name: 'assessmentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'questionId', referencedColumnName: 'id' },
  })
  questions: Question[];

  @Column('jsonb', { nullable: true })
  questionSelection: {
    method: 'fixed' | 'random' | 'adaptive';
    count?: number;
    categories?: {
      categoryId: string;
      count: number;
      difficulty?: 'mixed' | 'easy' | 'medium' | 'hard';
    }[];
    difficultyDistribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };

  @Column('jsonb', { nullable: true })
  conditionalLogic: {
    sections?: {
      id: string;
      title: string;
      questionIds: string[];
      requiredScore?: number;
      nextSectionRules?: {
        condition: string;
        nextSectionId: string;
      }[];
    }[];
    adaptiveRules?: {
      initialDifficulty: 'easy' | 'medium' | 'hard';
      adjustmentRules: {
        consecutiveCorrect: number;
        consecutiveIncorrect: number;
        difficultyChange: number;
      };
    };
  };

  @Column('jsonb', { nullable: true })
  scoringRules: {
    passingScore: number;
    method: 'simple' | 'weighted' | 'custom';
    penaltyForWrong?: number;
    bonusForTime?: {
      threshold: number;
      bonus: number;
    };
    categoryWeights?: {
      categoryId: string;
      weight: number;
    }[];
  };

  @Column('boolean', { default: false })
  shuffleQuestions: boolean;

  @Column('boolean', { default: false })
  showResults: boolean;

  @Column('boolean', { default: false })
  allowReview: boolean;

  @Column('boolean', { default: false })
  allowRetake: boolean;

  @Column('int', { default: 0 })
  maxAttempts: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'assessment_tags',
    joinColumn: { name: 'assessmentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'assessment_categories',
    joinColumn: { name: 'assessmentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @OneToMany(() => Attempt, attempt => attempt.assessment)
  attempts: Attempt[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}