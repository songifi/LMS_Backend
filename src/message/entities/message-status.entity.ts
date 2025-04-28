import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Message, message => message.statuses)
  message: Message;
}
