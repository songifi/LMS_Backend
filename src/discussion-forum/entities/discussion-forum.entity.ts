import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
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

  @ManyToOne(() => Object, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course?: { id: number };

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Topic, topic => topic.forum)
  topics: Topic[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
