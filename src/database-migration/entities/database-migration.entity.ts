import { Entity, Column, PrimaryColumn } from 'typeorm';
import { MigrationStatus } from '../enums/migration-status.enum';

@Entity('migration')
export class MigrationEntity {
  @PrimaryColumn()
  name: string;
  
  @Column({ type: 'timestamp' })
  executedAt: Date;
  
  @Column({ type: 'int', nullable: true })
  duration: number;
  
  @Column()
  checksum: string;
  
  @Column({
    type: 'enum',
    enum: MigrationStatus,
    default: MigrationStatus.COMPLETED
  })
  status: MigrationStatus;
  
  @Column({ nullable: true })
  errorMessage?: string;
}
