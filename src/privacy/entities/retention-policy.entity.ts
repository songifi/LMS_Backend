@Entity('retention_policies')
export class RetentionPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  entityName: string;

  @Column({ nullable: true })
  condition: string; // SQL WHERE clause for conditional retention

  @Column()
  retentionPeriod: number;

  @Column({
    type: 'enum',
    enum: RetentionPeriodUnit,
    default: RetentionPeriodUnit.YEARS,
  })
  retentionPeriodUnit: RetentionPeriodUnit;

  @Column()
  isActive: boolean;
  
  @Column('jsonb', { nullable: true })
  actionOnExpiry: {
    action: 'delete' | 'anonymize' | 'archive';
    strategy?: string; // For anonymization
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
