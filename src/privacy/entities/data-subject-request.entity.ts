@Entity('data_subject_requests')
export class DataSubjectRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestReference: string; // Reference number for the request

  @Column()
  subjectId: string; // ID or identifier of the data subject

  @Column({
    type: 'enum',
    enum: DataSubjectRequestType,
  })
  requestType: DataSubjectRequestType;

  @Column('text')
  requestDetails: string;

  @Column({
    type: 'enum',
    enum: DataSubjectRequestStatus,
    default: DataSubjectRequestStatus.PENDING,
  })
  status: DataSubjectRequestStatus;

  @Column('jsonb', { nullable: true })
  affectedSystems: string[]; // List of systems that need to be queried

  @Column('jsonb', { nullable: true })
  actionHistory: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    notes?: string;
  }>;

  @Column({ nullable: true })
  assignedTo: string;
  
  @Column({ nullable: true })
  dueDate: Date;
  
  @Column({ default: false })
  identityVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
