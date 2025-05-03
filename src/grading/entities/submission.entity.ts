import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Assignment } from './assignment.entity';
import { Feedback } from './feedback.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assignmentId: string;

  @Column()
  studentId: string;

  @Column()
  studentName: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'submitted',
  })
  status: string;

  @Column({ type: 'float', nullable: true })
  grade: number;

  @Column({ type: 'float', nullable: true })
  similarityScore: number;

  @Column()
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Assignment, assignment => assignment.submissions)
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @OneToOne(() => Feedback, feedback => feedback.submission)
  feedback: Feedback;
}