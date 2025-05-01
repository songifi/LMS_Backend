import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('migration_lock')
export class MigrationLockEntity {
  @PrimaryColumn()
  id: number;
  
  @Column()
  locked: boolean;
  
  @Column({ type: 'timestamp', nullable: true })
  lockedAt: Date;
}
