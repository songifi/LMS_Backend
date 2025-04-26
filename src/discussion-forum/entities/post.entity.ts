import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from './topic.entity';
import { ForumAttachment } from './forum-attachment.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  isReported: boolean;

  @Column({ type: 'text', nullable: true })
reportReason: string | null;

  @Column({ default: false })
  isModerated: boolean;

  @ManyToOne(() => Topic, topic => topic.posts, { onDelete: 'CASCADE' })
  topic: Topic;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => Post, { nullable: true })
  replyTo: Post;

  @OneToMany(() => ForumAttachment, attachment => attachment.post)
  attachments: ForumAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}