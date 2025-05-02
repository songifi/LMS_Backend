import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    OneToMany 
  } from 'typeorm';
  import { CveAlert } from './cve-alert.entity';
  import { SecurityReport } from './security-report.entity';
import { IssueSeverity } from '../enums/issueSeverity.enum';
import { IssueStatus } from '../enums/issueStatus.enum';
import { IssueSource } from '../enums/issueSource.enum';
  
  @Entity()
  export class SecurityIssue {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({
      type: 'enum',
      enum: IssueSeverity,
      default: IssueSeverity.MEDIUM,
    })
    severity: IssueSeverity;
  
    @Column({
      type: 'enum',
      enum: IssueStatus,
      default: IssueStatus.OPEN,
    })
    status: IssueStatus;
  
    @Column({
      type: 'enum',
      enum: IssueSource,
      default: IssueSource.SCAN,
    })
    source: IssueSource;
  
    @Column({ nullable: true })
    affectedComponent: string;
  
    @Column('text', { nullable: true })
    remediationSteps: string;
    
    @Column({ nullable: true })
    assignedTo: string;
  
    @Column({ nullable: true })
    reportedBy: string;
  
    @Column({ default: false })
    public: boolean;
  
    @ManyToOne(() => CveAlert, cve => cve.securityIssues, { nullable: true })
    relatedCve: CveAlert;
  
    @OneToMany(() => SecurityReport, report => report.securityIssue)
    reports: SecurityReport[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
    
    @Column({ nullable: true })
    resolvedAt: Date;
  }