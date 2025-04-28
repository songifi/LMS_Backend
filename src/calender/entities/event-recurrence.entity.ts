import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { RecurrenceFrequency } from '../enums/recurrenceFrequency.enum';

@Entity()
export class EventRecurrence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Event, (event) => event.recurrence)
  @JoinColumn()
  event: Event;

  @Column()
  eventId: string;

  @Column({ type: 'enum', enum: RecurrenceFrequency })
  frequency: RecurrenceFrequency;

  @Column({ default: 1 })
  interval: number;

  @Column({ type: 'jsonb', nullable: true })
  byDay: string[];

  @Column({ type: 'jsonb', nullable: true })
  byMonthDay: number[];

  @Column({ type: 'jsonb', nullable: true })
  byMonth: number[];

  @Column({ nullable: true })
  count: number;

  @Column({ nullable: true })
  until: Date;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  exceptionDates: Date[];

  // RFC 5545 iCalendar standard compatibility
  @Column({ nullable: true })
  rrule: string;
}