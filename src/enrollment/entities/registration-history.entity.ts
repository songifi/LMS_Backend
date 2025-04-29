import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Registration } from './registration.entity'
import { RegistrationStatus } from '../enums/registrationStatus.enum'

@Entity('registration_history')
export class RegistrationHistory {
  @ApiProperty({ description: 'Unique identifier for the registration history entry' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ description: 'Previous status of the registration' })
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    enumName: 'registration_status_enum', // Enum name required for PostgreSQL
  })
  previousStatus: RegistrationStatus

  @ApiProperty({ description: 'New status of the registration' })
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    enumName: 'registration_status_enum', // Same enum name as above
  })
  newStatus: RegistrationStatus

  @ApiProperty({ description: 'ID of the user who made the change' })
  @Column({ nullable: true })
  changedBy: string

  @ApiProperty({ description: 'Reason for the status change' })
  @Column({ type: 'text', nullable: true })
  reason: string

  @ManyToOne(() => Registration, (registration) => registration.history)
  @JoinColumn({ name: 'registration_id' })
  registration: Registration

  @Column()
  registrationId: string

  @ApiProperty({ description: 'Date when the record was created' })
  @CreateDateColumn()
  createdAt: Date
}
