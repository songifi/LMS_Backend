import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MigrationOperation } from '../enums/migration-operation.enum';

@Entity('migration_history')
export class MigrationHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  migrationName: string;
  
  @Column({
    type: 'enum',
    enum: MigrationOperation
  })
  operation: MigrationOperation;
  
  @Column({ type: 'timestamp' })
  timestamp: Date;
  
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
  
  @Column({ nullable: true })
  errorMessage?: string;
}
