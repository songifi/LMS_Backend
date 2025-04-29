import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  iconUrl: string;

  @ManyToOne(() => User, user => user.badges)
  student: User;
}
