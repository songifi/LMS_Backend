import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Forum } from './discussion-forum.entity';
import { User } from 'src/user/entities/user.entity';
import { Post } from './post.entity';
import { ForumSubscription } from './forum-subscription.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @ManyToOne(() => Forum, forum => forum.topics, { onDelete: 'CASCADE' })
  forum: Forum;

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Post, post => post.topic)
  posts: Post[];

  @OneToMany(() => ForumSubscription, subscription => subscription.topic)
  subscriptions: ForumSubscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  viewCount: number;
}
