import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Question } from './question.entity';
  
  @Entity('question_options')
  export class QuestionOption {
    @ApiProperty({ description: 'Unique option identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Option text' })
    @Column()
    text: string;
  
    @ApiProperty({ description: 'Option order' })
    @Column({ default: 0 })
    order: number;
  
    @ApiProperty({ description: 'Option value (for analysis)' })
    @Column({ nullable: true })
    value: number;
  
    // Relationships
    @ManyToOne(() => Question, question => question.options, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: Question;
  
    @Column()
    questionId: string;
  }
  