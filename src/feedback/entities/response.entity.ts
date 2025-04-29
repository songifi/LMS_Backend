import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Survey } from './survey.entity';
  
  @Entity('responses')
  export class Response {
    @ApiProperty({ description: 'Unique response identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Respondent identifier (anonymized if needed)' })
    @Column({ nullable: true })
    respondentId: string;
  
    @ApiProperty({ description: 'JSON data with all question responses' })
    @Column({ type: 'jsonb' })
    data: Record<string, any>;
  
    @ApiProperty({ description: 'IP address (hashed if anonymous)' })
    @Column({ nullable: true })
    ipAddress: string;
  
    @ApiProperty({ description: 'User agent (partial if anonymous)' })
    @Column({ nullable: true })
    userAgent: string;
  
    @ApiProperty({ description: 'Submission timestamp' })
    @CreateDateColumn()
    submittedAt: Date;
  
    @ApiProperty({ description: 'Duration (in seconds) to complete the survey' })
    @Column({ nullable: true })
    completionTime: number;
  
    // Relationships
    @ManyToOne(() => Survey, survey => survey.responses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey: Survey;
  
    @Column()
    surveyId: string;
  }