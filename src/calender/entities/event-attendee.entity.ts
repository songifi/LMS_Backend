import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Event } from './event.entity';
import { User } from 'src/user/entities/user.entity';
  
  export enum AttendeeStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    TENTATIVE = 'tentative',
  }
  
  export enum AttendeeRole {
    REQUIRED = 'required',
    OPTIONAL = 'optional',
    ORGANIZER = 'organizer',
  }
  
  @Entity()
  export class EventAttendee {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Event, (event) => event.attendees, { onDelete: 'CASCADE' })
    event: Event;
  
    @Column()
    eventId: string;
  
    @ManyToOne(() => User)
    user: User;
  
    @Column({ nullable: true })
     userId: string | null;
  
    @Column({ nullable: true })
    email: string;
  
    @Column({
      type: 'enum',
      enum: AttendeeStatus,
      default: AttendeeStatus.PENDING,
    })
    status: AttendeeStatus;
  
    @Column({
      type: 'enum',
      enum: AttendeeRole,
      default: AttendeeRole.REQUIRED,
    })
    role: AttendeeRole;
  
    @Column({ default: false })
    isNotified: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }