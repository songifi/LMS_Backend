import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';

@Entity('course_notifications')
export class CourseNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipientId: string;

  @Column()
  courseId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('text')
  message: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;
}