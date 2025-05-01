import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { Mapping } from './mapping.entity';

export enum OutcomeLevel {
  PROGRAM = 'program',
  INSTITUTIONAL = 'institutional',
}

@Entity()
export class LearningOutcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: OutcomeLevel,
    default: OutcomeLevel.PROGRAM
  })
  level: OutcomeLevel;

  @ManyToOne(() => Program, program => program.learningOutcomes)
  program: Program;

  @OneToMany(() => Mapping, mapping => mapping.learningOutcome)
  mappings: Mapping[];

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}