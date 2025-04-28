import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageFolder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userId: number;
}
