import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Survey } from './survey.entity';
  import { QuestionType } from '../enums/question-type.enum';
import { QuestionOption } from './question-option.entity';
  
  @Entity('questions')
  export class Question {
    @ApiProperty({ description: 'Unique question identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Question text' })
    @Column({ type: 'text' })
    text: string;
  
    @ApiProperty({ description: 'Question help text' })
    @Column({ type: 'text', nullable: true })
    helpText: string;
  
    @ApiProperty({ enum: QuestionType, enumName: 'QuestionType' })
    @Column({
      type: 'enum',
      enum: QuestionType,
    })
    type: QuestionType;
  
    @ApiProperty({ description: 'Question order within the survey' })
    @Column({ default: 0 })
    order: number;
  
    @ApiProperty({ description: 'Whether answering this question is required' })
    @Column({ default: false })
    isRequired: boolean;
  
    @ApiProperty({ description: 'For scale/rating questions, defines the min value' })
    @Column({ nullable: true })
    minValue: number;
  
    @ApiProperty({ description: 'For scale/rating questions, defines the max value' })
    @Column({ nullable: true })
    maxValue: number;
  
    @ApiProperty({ description: 'Min label for scale questions' })
    @Column({ nullable: true })
    minLabel: string;
  
    @ApiProperty({ description: 'Max label for scale questions' })
    @Column({ nullable: true })
    maxLabel: string;
  
    // Relationships
    @ManyToOne(() => Survey, survey => survey.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey: Survey;
  
    @Column()
    surveyId: string;
  
    @OneToMany(() => QuestionOption, option => option.question, {
      cascade: true,
      eager: true,
    })
    options: QuestionOption[];
  }