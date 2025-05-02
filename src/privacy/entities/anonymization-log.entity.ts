@Entity('anonymization_logs')
export class AnonymizationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityName: string;

  @Column()
  recordId: string;

  @Column('jsonb')
  fieldsAnonymized: string[];

  @Column()
  anonymizationStrategy: string;

  @Column({ nullable: true })
  relatedToRequest: string; // ID of a data subject request if applicable

  @Column()
  performedBy: string;

  @CreateDateColumn()
  performedAt: Date;
}