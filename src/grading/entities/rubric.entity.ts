import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { RubricCriterion } from './rubric-criterion.entity';
import { Assignment } from './assignment.entity';

@Entity('rubrics')
export class Rubric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'int' })
  totalPoints: number;

  @Column({ default: false })
  isTemplate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RubricCriterion, criterion => criterion.rubric, {
    cascade: true,
    eager: true,
  })
  criteria: RubricCriterion[];

  @OneToOne(() => Assignment, assignment => assignment.rubric)
  assignment: Assignment;
}