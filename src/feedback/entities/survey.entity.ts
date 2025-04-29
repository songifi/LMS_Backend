import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { SurveyStatus } from '../enums/survey-status.enum';
import { Question } from './question.entity';
import { EvaluationPeriod } from './evaluation-period.entity';
import { SurveyResult } from './survey-result.entity';
import { Response } from './response.entity';

  
  @Entity('surveys')
  export class Survey {
    @ApiProperty({ description: 'Unique survey identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Survey title' })
    @Column()
    title: string;
  
    @ApiProperty({ description: 'Survey description' })
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @ApiProperty({ description: 'Whether responses are anonymous' })
    @Column({ default: false })
    isAnonymous: boolean;
  
    @ApiProperty({ enum: SurveyStatus, enumName: 'SurveyStatus' })
    @Column({
      type: 'enum',
      enum: SurveyStatus,
      default: SurveyStatus.DRAFT,
    })
    status: SurveyStatus;
  
    @ApiProperty({ description: 'Survey creation date' })
    @CreateDateColumn()
    createdAt: Date;
  
    @ApiProperty({ description: 'Survey last update date' })
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relationships
    @OneToMany(() => Question, question => question.survey, {
      cascade: true,
      eager: true,
    })
    questions: Question[];
  
    @ManyToMany(() => EvaluationPeriod)
    @JoinTable({
      name: 'survey_evaluation_periods',
      joinColumn: { name: 'survey_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'evaluation_period_id', referencedColumnName: 'id' },
    })
    evaluationPeriods: EvaluationPeriod[];
  
    @OneToMany(() => Response, response => response.survey)
    responses: Response[];
  
    @OneToMany(() => SurveyResult, result => result.survey)
    results: SurveyResult[];
  }
  