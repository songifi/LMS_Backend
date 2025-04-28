import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participantOneId: number;

  @Column()
  participantTwoId: number;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}
