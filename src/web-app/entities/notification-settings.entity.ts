
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({ type: 'boolean', default: true })
  assignmentReminders: boolean;
  
  @Column({ type: 'boolean', default: true })
  courseUpdates: boolean;
  
  @Column({ type: 'boolean', default: true })
  discussionReplies: boolean;
  
  @Column({ type: 'boolean', default: true })
  gradePosted: boolean;
  
  @Column({ type: 'timestamp' })
  createdAt: Date;
  
  @Column({ type: 'timestamp' })
  updatedAt: Date;
}