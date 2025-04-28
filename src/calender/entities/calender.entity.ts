import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
import { CalendarType } from '../enums/calendarType';
import { User } from 'src/user/entities/user.entity';
import { Event } from './event.entity';
  
  @Entity()
  export class Calendar {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ type: 'enum', enum: CalendarType, default: CalendarType.PERSONAL })
    type: CalendarType;
  
    @Column({ default: '#3788d8' })
    color: string;
  
    @ManyToOne(() => User, { eager: false })
    owner: User;
  
    @Column()
    ownerId: string;
  
    @OneToMany(() => Event, (event) => event.calendar)
    events: Event[];
  
    @ManyToMany(() => User)
    @JoinTable({
      name: 'calendar_shares',
      joinColumn: { name: 'calendar_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    sharedWith: User[];
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ default: false })
    isDefault: boolean;
  
    @Column({ default: false })
    isPublic: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }