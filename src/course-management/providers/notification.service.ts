import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseNotification } from '../entities/course-notification.entity';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(CourseNotification)
    private notificationRepository: Repository<CourseNotification>,
    private configService: ConfigService,
  ) {}

  async sendNotification(notificationData: {
    recipientId: string;
    courseId: string;
    sessionId?: string;
    type: NotificationType;
    message: string;
    priority: NotificationPriority;
  }): Promise<CourseNotification> {
    // Create notification record
    const notification = this.notificationRepository.create({
      ...notificationData,
      sentAt: new Date(),
      isRead: false,
    });
    
    await this.notificationRepository.save(notification);

    // Here you would integrate with external notification services
    // such as email, SMS, or push notifications
    
    if (this.configService.get<string>('ENABLE_EMAIL_NOTIFICATIONS') === 'true') {
      await this.sendEmailNotification(notification);
    }

    return notification;
  }

  async getNotifications(userId: string, isRead?: boolean): Promise<CourseNotification[]> {
    const query: any = { recipientId: userId };
    
    if (isRead !== undefined) {
      query.isRead = isRead;
    }
    
    return this.notificationRepository.find({
      where: query,
      order: { sentAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string): Promise<CourseNotification> {
    await this.notificationRepository.update(notificationId, { isRead: true });
    const notification = await this.notificationRepository.findOneBy({ id: notificationId });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    
    return notification;
  }

  private async sendEmailNotification(notification: CourseNotification): Promise<void> {
    // This is a placeholder for email integration
    // Implement actual email sending logic based on your email provider
    console.log(`[EMAIL NOTIFICATION] To: ${notification.recipientId}, Subject: Course Notification: ${notification.type}, Message: ${notification.message}`);
  }
}