import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rubric } from './rubric.entity';

@Entity('rubric_criteria')
export class RubricCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rubricId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'float' })
  maxScore: number;

  @Column('json', { nullable: true })
  scoreDescriptors: {
    score: number;
    description: string;
  }[];

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Rubric, rubric => rubric.criteria)
  @JoinColumn({ name: 'rubricId' })
  rubric: Rubric;
}