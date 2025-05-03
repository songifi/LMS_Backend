import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AccessibilityIssue } from './accessibility-issue.entity';

@Entity()
export class AccessibilityRemediationTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccessibilityIssue, issue => issue.remediationTasks)
  @JoinColumn()
  issue: AccessibilityIssue;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'canceled'] })
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';

  @Column({ nullable: true })
  assignee: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'enum', enum: ['high', 'medium', 'low'] })
  priority: 'high' | 'medium' | 'low';

  @Column({ nullable: true })
  estimatedEffort: string;
}