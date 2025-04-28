import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Notification } from "../entities/notification.entity"
import { NotificationType } from "../entities/notification-type.entity"
import { NotificationDelivery } from "../entities/notification-delivery.entity"
import type { CreateNotificationDto } from "../dto/create-notification.dto"
import type { UpdateNotificationDto } from "../dto/update-notification.dto"
import type { QueryNotificationsDto } from "../dto/query-notifications.dto"
import type { DeliveryChannel } from "../entities/notification-template.entity"
import { DeliveryStatus } from "../entities/notification-delivery.entity"
import { NotificationTemplateService } from "./notification-template.service"
import { NotificationPreferenceService } from "./notification-preference.service"
import { NotificationDeliveryService } from "./notification-delivery.service"
import { NotificationStatus } from "../enums/notificationStatus.enum"

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
    @InjectRepository(NotificationDelivery)
    private notificationDeliveryRepository: Repository<NotificationDelivery>,
    private notificationTemplateService: NotificationTemplateService,
    private notificationPreferenceService: NotificationPreferenceService,
    private notificationDeliveryService: NotificationDeliveryService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const type = await this.notificationTypeRepository.findOneBy({ id: createNotificationDto.typeId });
    if (!type) {
      throw new NotFoundException(`Notification type with ID ${createNotificationDto.typeId} not found`);
    }
  
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      status: NotificationStatus.PENDING,
      expiresAt: createNotificationDto.expiresAt ? new Date(createNotificationDto.expiresAt) : undefined,
    });
  
    const savedNotification = await this.notificationRepository.save(notification);
  
    const preferences = await this.notificationPreferenceService.getUserPreferencesForType(
      createNotificationDto.userId,
      createNotificationDto.typeId,
    );
  
    const enabledChannels = preferences.filter((pref) => pref.enabled).map((pref) => pref.channel);
  
    if (enabledChannels.length > 0) {
      await this.createDeliveries(savedNotification, enabledChannels);
      this.processDeliveries(savedNotification.id).catch((error) => {
        console.error(`Error processing notification deliveries: ${error.message}`, error.stack);
      });
    }
  
    return savedNotification;
  }
  
  private async createDeliveries(notification: Notification, channels: DeliveryChannel[]): Promise<void> {
    const deliveries = channels.map((channel) => {
      return this.notificationDeliveryRepository.create({
        notification,
        notificationId: notification.id,
        channel,
      })
    })

    await this.notificationDeliveryRepository.save(deliveries)
  }

  private async processDeliveries(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ["deliveries", "type"],
    })

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`)
    }

    // Process each delivery channel
    for (const delivery of notification.deliveries) {
      try {
        // Get template for this notification type and channel
        const template = await this.notificationTemplateService.getTemplateForTypeAndChannel(
          notification.typeId,
          delivery.channel,
        )

        if (!template) {
          delivery.status = DeliveryStatus.FAILED
          delivery.errorMessage = `No template found for type ${notification.typeId} and channel ${delivery.channel}`
          await this.notificationDeliveryRepository.save(delivery)
          continue
        }

        // Send notification through appropriate channel
        await this.notificationDeliveryService.sendNotification(notification, delivery, template)
      } catch (error) {
        delivery.status = DeliveryStatus.FAILED
        delivery.errorMessage = error.message
        await this.notificationDeliveryRepository.save(delivery)
      }
    }

    // Update notification status
    const allDeliveries = await this.notificationDeliveryRepository.findBy({ notificationId })
    const allFailed = allDeliveries.every((d) => d.status === DeliveryStatus.FAILED)
    const someDelivered = allDeliveries.some(
      (d) => d.status === DeliveryStatus.DELIVERED || d.status === DeliveryStatus.SENT,
    )

    notification.status = allFailed
      ? NotificationStatus.FAILED
      : someDelivered
        ? NotificationStatus.DELIVERED
        : NotificationStatus.PENDING

    await this.notificationRepository.save(notification)
  }

  async findAll(userId: string, queryDto: QueryNotificationsDto): Promise<[Notification[], number]> {
    const { isRead, typeId, priority, createdAfter, createdBefore, limit, offset } = queryDto

    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.type", "type")
      .where("notification.userId = :userId", { userId })

    if (isRead !== undefined) {
      queryBuilder.andWhere("notification.isRead = :isRead", { isRead })
    }

    if (typeId) {
      queryBuilder.andWhere("notification.typeId = :typeId", { typeId })
    }

    if (priority) {
      queryBuilder.andWhere("notification.priority = :priority", { priority })
    }

    if (createdAfter) {
      queryBuilder.andWhere("notification.createdAt >= :createdAfter", {
        createdAfter: new Date(createdAfter),
      })
    }

    if (createdBefore) {
      queryBuilder.andWhere("notification.createdAt <= :createdBefore", {
        createdBefore: new Date(createdBefore),
      })
    }

    queryBuilder.orderBy("notification.createdAt", "DESC").take(limit).skip(offset)

    return queryBuilder.getManyAndCount()
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
      relations: ["type", "deliveries"],
    })

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId)

    if (updateNotificationDto.isRead !== undefined) {
      notification.isRead = updateNotificationDto.isRead

      if (updateNotificationDto.isRead && !notification.readAt) {
        notification.readAt = new Date()
      }
    }

    if (updateNotificationDto.readAt) {
      notification.readAt = new Date(updateNotificationDto.readAt)
      notification.isRead = true
    }

    return this.notificationRepository.save(notification)
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId)
    await this.notificationRepository.remove(notification)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    })
  }

  async batchCreate(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const createdNotifications: Notification[] = []

    for (const notificationDto of notifications) {
      const notification = await this.create(notificationDto)
      createdNotifications.push(notification)
    }

    return createdNotifications
  }
}
