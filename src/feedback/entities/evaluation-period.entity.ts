import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Survey } from './survey.entity';
  
  @Entity('evaluation_periods')
  export class EvaluationPeriod {
    @ApiProperty({ description: 'Unique period identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({ description: 'Period name' })
    @Column()
    name: string;
  
    @ApiProperty({ description: 'Period description' })
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @ApiProperty({ description: 'Start date of evaluation period' })
    @Column()
    startDate: Date;
  
    @ApiProperty({ description: 'End date of evaluation period' })
    @Column()
    endDate: Date;
  
    @ApiProperty({ description: 'Is this period currently active' })
    @Column({ default: false })
    isActive: boolean;
  
    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    createdAt: Date;
  
    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relationships
    @ManyToMany(() => Survey, survey => survey.evaluationPeriods)
    surveys: Survey[];
  }