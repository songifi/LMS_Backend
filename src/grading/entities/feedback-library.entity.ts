import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feedback_library')
export class FeedbackLibrary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  courseId: string;

  @Column({ default: 1 })
  usageCount: number;

  @Column({ type: 'float', nullable: true })
  sentiment: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}