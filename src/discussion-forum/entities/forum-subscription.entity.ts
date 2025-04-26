import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { Topic } from './topic.entity';
import { User } from 'src/user/entities/user.entity';
import { Forum } from './discussion-forum.entity';

@Entity()
export class ForumSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Forum, { nullable: true })
  forum: Forum;

  @ManyToOne(() => Topic, topic => topic.subscriptions, { nullable: true })
  topic: Topic;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
