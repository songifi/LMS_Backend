// src/forum/entities/discussion-forum.entity.ts
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity()
export class Forum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isGlobal: boolean;

  @Column({ nullable: true })
  courseId?: number; // Just a simple number field for now, no relation

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Topic, topic => topic.forum)
  topics: Topic[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
