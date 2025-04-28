import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Event } from './event.entity';
import { ReminderType } from '../enums/reminderType.enum';
  
  @Entity()
  export class EventReminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Event, (event) => event.reminders, { onDelete: 'CASCADE' })
    event: Event;
  
    @Column()
    eventId: string;
  
    @Column({ type: 'enum', enum: ReminderType })
    type: ReminderType;
  
    @Column()
    minutesBefore: number;
  
    @Column({ default: false })
    isSent: boolean;
  
    @Column({ nullable: true })
    scheduledTime: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }