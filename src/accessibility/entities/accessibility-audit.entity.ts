import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { AccessibilityIssue } from './accessibility-issue.entity';

@Entity()
export class AccessibilityAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['automated', 'manual'] })
  type: 'automated' | 'manual';

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  auditor: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'enum', enum: ['in_progress', 'completed'] })
  status: 'in_progress' | 'completed';

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => AccessibilityIssue, issue => issue)
  issues: AccessibilityIssue[];
}