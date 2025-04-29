import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  
  @Entity('survey_templates')
  export class SurveyTemplate {
    @ApiProperty({ description: 'Unique template identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Template name' })
    @Column()
    name: string;
  
    @ApiProperty({ description: 'Template description' })
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @ApiProperty({ description: 'Template structure as JSON' })
    @Column({ type: 'jsonb' })
    structure: Record<string, any>;
  
    @ApiProperty({ description: 'Template category' })
    @Column({ nullable: true })
    category: string;
  
    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    createdAt: Date;
  
    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updatedAt: Date;
  }