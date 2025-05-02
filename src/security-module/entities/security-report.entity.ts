import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne, 
  } from 'typeorm';
  import { SecurityIssue } from './security-issue.entity';
import { ReportType } from '../enums/reportType.enum';
  
  @Entity()
  export class SecurityReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column({
      type: 'enum',
      enum: ReportType,
      default: ReportType.SCAN,
    })
    type: ReportType;
  
    @Column('text')
    content: string;
  
    @Column({ nullable: true })
    generatedBy: string;
  
    @Column({ default: false })
    shared: boolean;
  
    @Column({ nullable: true })
    sharedWith: string;
  
    @ManyToOne(() => SecurityIssue, issue => issue.reports, { nullable: true })
    securityIssue: SecurityIssue;
  
    @Column({ nullable: true })
    scanId: string;
  
    @Column({ nullable: true })
    pentestId: string;
  
    @Column('simple-array', { nullable: true })
    tags: string[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  