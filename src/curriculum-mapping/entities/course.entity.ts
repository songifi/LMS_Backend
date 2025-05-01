import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { Assessment } from './assessment.entity';
import { Mapping } from './mapping.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  credits: number;

  @ManyToOne(() => Program, program => program.courses)
  program: Program;

  @OneToMany(() => Assessment, assessment => assessment.course)
  assessments: Assessment[];

  @OneToMany(() => Mapping, mapping => mapping.course)
  mappings: Mapping[];

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
