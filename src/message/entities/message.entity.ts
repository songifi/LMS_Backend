import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { MessageAttachment } from './message-attachment.entity';
import { MessageStatus } from './message-status.entity';


@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column()
  content: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { nullable: true })
  conversation: Conversation;

  @OneToMany(() => MessageAttachment, attachment => attachment.message)
  attachments: MessageAttachment[];

  @OneToMany(() => MessageStatus, status => status.message)
  statuses: MessageStatus[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
