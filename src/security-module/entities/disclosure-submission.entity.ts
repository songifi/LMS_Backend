import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn 
  } from 'typeorm';
import { DisclosureStatus } from '../enums/disclosureStatus.enum';
  
  @Entity()
  export class DisclosureSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column('text')
    proofOfConcept: string;
  
    @Column({ nullable: true })
    reporterName: string;
  
    @Column({ nullable: true })
    reporterEmail: string;
  
    @Column({
      type: 'enum',
      enum: DisclosureStatus,
      default: DisclosureStatus.SUBMITTED,
    })
    status: DisclosureStatus;
  
    @Column({ nullable: true })
    reviewedBy: string;
  
    @Column('text', { nullable: true })
    reviewNotes: string;
  
    @Column({ nullable: true })
    securityIssueId: string;
  
    @Column({ default: false })
    eligibleForBounty: boolean;
  
    @Column({ nullable: true })
    bountyAmount: number;
  
    @Column({ nullable: true })
    bountyPaid: boolean;
  
    @Column({ nullable: true })
    publishedUrl: string;
  
    @Column({ default: false })
    confirmedDuplicate: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  