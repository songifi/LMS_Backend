import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileUrl: string;

  @ManyToOne(() => Message, message => message.attachments)
  message: Message;
}
