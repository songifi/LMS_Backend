import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class AccessibilityReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  generatedAt: Date;

  @Column({ type: 'jsonb' })
  summary: {
    totalIssues: number;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
    resolvedIssues: number;
    openIssues: number;
    wcagConformanceLevel: string;
    passedTests: number;
    failedTests: number;
  };

  @Column({ type: 'jsonb' })
  detailedResults: any;

  @Column({ type: 'enum', enum: ['pdf', 'html', 'json'] })
  format: 'pdf' | 'html' | 'json';

  @Column({ nullable: true })
  filePath: string;
}