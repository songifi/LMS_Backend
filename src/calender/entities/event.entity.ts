import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
  } from 'typeorm';
import { EventType } from '../enums/eventType.enum';
import { Calendar } from './calender.entity';
import { EventRecurrence } from './event-recurrence.entity';
import { EventAttendee } from './event-attendee.entity';
import { EventReminder } from './event-reminder.entity';
  
  @Entity()
  export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column({ nullable: true, type: 'text' })
    description: string;
  
    @Column({ type: 'enum', enum: EventType, default: EventType.PERSONAL })
    type: EventType;
  
    @Column()
    startDate: Date;
  
    @Column()
    endDate: Date;
  
    @Column({ default: false })
    isAllDay: boolean;
  
    @Column({ default: false })
    isRecurring: boolean;
  
    @Column({ nullable: true })
    location: string;
  
    @Column({ default: '#3788d8' })
    color: string;
  
    @ManyToOne(() => Calendar, (calendar) => calendar.events, { 
      onDelete: 'CASCADE' 
    })
    calendar: Calendar;
  
    @Column()
    calendarId: string;
  
    @OneToOne(() => EventRecurrence, (recurrence) => recurrence.event, {
      cascade: true,
      nullable: true,
    })
    recurrence: EventRecurrence;
  
    @OneToMany(() => EventAttendee, (attendee) => attendee.event, {
      cascade: true,
    })
    attendees: EventAttendee[];
  
    @OneToMany(() => EventReminder, (reminder) => reminder.event, {
      cascade: true,
    })
    reminders: EventReminder[];
  
    @Column({ nullable: true })
    externalId: string;
  
    @Column({ default: false })
    isPrivate: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }