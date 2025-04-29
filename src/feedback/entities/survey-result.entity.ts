import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Survey } from './survey.entity';
  
  @Entity('survey_results')
  export class SurveyResult {
    @ApiProperty({ description: 'Unique result identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Calculated results as JSON' })
    @Column({ type: 'jsonb' })
    data: Record<string, any>;
  
    @ApiProperty({ description: 'Total number of responses' })
    @Column({ default: 0 })
    responseCount: number;
  
    @ApiProperty({ description: 'Result generation date' })
    @CreateDateColumn()
    generatedAt: Date;
  
    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relationships
    @ManyToOne(() => Survey, survey => survey.results, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey: Survey;
  
    @Column()
    surveyId: string;
  }