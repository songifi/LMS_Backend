import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;
}
