import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AccessibilityRemediationTask } from './accessibility-remediation-task.entity';

@Entity()
export class AccessibilityIssue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['automated', 'manual'] })
  type: 'automated' | 'manual';

  @Column()
  wcagCriterion: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['critical', 'serious', 'moderate', 'minor'] })
  impactLevel: 'critical' | 'serious' | 'moderate' | 'minor';

  @Column({ type: 'enum', enum: ['high', 'medium', 'low'] })
  priorityLevel: 'high' | 'medium' | 'low';

  @Column({ type: 'enum', enum: ['open', 'in_progress', 'resolved', 'wont_fix'] })
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';

  @Column()
  url: string;

  @Column({ nullable: true })
  htmlSnippet: string;

  @Column({ nullable: true })
  elementPath: string;

  @Column({ nullable: true })
  recommendations: string;

  @CreateDateColumn()
  detectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @OneToMany(() => AccessibilityRemediationTask, task => task.issue)
  remediationTasks: AccessibilityRemediationTask[];
}
