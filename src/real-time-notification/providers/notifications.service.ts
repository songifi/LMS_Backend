import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { RedisService } from '../common/redis/redis.service';
import { PushService } from '../push/push.service';
import { PresenceService } from '../presence/presence.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferencesRepository: Repository<NotificationPreference>,
    private redisService: RedisService,
    private pushService: PushService,
    private presenceService: PresenceService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    
    // Check user preferences before creating notification
    const preference = await this.getPreferenceForUser(
      createNotificationDto.recipientId, 
      createNotificationDto.type
    );
    
    if (!preference || !preference.enabled) {
      return null; // Don't create notification if disabled
    }

    const savedNotification = await this.notificationsRepository.save(notification);
    
    // Publish to Redis for real-time delivery
    await this.redisService.publish(
      'notifications', 
      JSON.stringify(savedNotification)
    );
    
    // Check if user is online
    const isOnline = await this.presenceService.isUserOnline(createNotificationDto.recipientId);
    
    // Send push notification if user is offline and push is enabled
    if (!isOnline && preference.pushEnabled) {
      await this.pushService.sendPushNotification({
        userId: createNotificationDto.recipientId,
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        data: {
          notificationId: savedNotification.id,
          type: createNotificationDto.type,
          ...createNotificationDto.data,
        },
      });
    }
    
    return savedNotification;
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipientId: userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, recipientId: userId },
    });
    
    if (!notification) {
      return null;
    }
    
    notification.isRead = true;
    await this.redisService.markNotificationAsRead(userId, id);
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
  }

  async getPreferenceForUser(userId: string, type: string): Promise<NotificationPreference> {
    let preference = await this.preferencesRepository.findOne({
      where: { userId, type },
    });
    
    if (!preference) {
      // Create default preference if none exists
      preference = this.preferencesRepository.create({
        userId,
        type: type as any,
        enabled: true,
        pushEnabled: true,
        emailEnabled: true,
      });
      await this.preferencesRepository.save(preference);
    }
    
    return preference;
  }

  async updatePreferences(
    userId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    let preference = await this.getPreferenceForUser(userId, updateDto.type);
    
    // Update only provided fields
    if (updateDto.enabled !== undefined) {
      preference.enabled = updateDto.enabled;
    }
    
    if (updateDto.pushEnabled !== undefined) {
      preference.pushEnabled = updateDto.pushEnabled;
    }
    
    if (updateDto.emailEnabled !== undefined) {
      preference.emailEnabled = updateDto.emailEnabled;
    }
    
    return this.preferencesRepository.save(preference);
  }
}
