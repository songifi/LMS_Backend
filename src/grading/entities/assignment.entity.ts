import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Submission } from './submission.entity';
import { Rubric } from './rubric.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  courseId: string;

  @Column({ nullable: true })
  rubricId: string;

  @Column({ nullable: true })
  maxScore: number;

  @Column({ nullable: true })
  passingThreshold: number;

  @Column({ default: false })
  published: boolean;

  @Column({ nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Submission, submission => submission.assignment)
  submissions: Submission[];

  @ManyToOne(() => Rubric, { eager: false })
  @JoinColumn({ name: 'rubricId' })
  rubric: Rubric;
}