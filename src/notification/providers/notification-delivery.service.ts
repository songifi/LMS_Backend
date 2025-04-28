import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ConfigService } from "@nestjs/config"
import { Notification } from "../entities/notification.entity"
import { NotificationDelivery, DeliveryStatus } from "../entities/notification-delivery.entity"
import { NotificationTemplate, DeliveryChannel } from "../entities/notification-template.entity"
import { NotificationTemplateService } from "./notification-template.service"

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    @InjectRepository(NotificationDelivery)
    private deliveryRepository: Repository<NotificationDelivery>,
    private configService: ConfigService,
    private templateService: NotificationTemplateService,
  ) { }

  async sendNotification(
    notification: Notification,
    delivery: NotificationDelivery,
    template: NotificationTemplate,
  ): Promise<NotificationDelivery> {
    try {
      // Render template with notification data
      const rendered = await this.templateService.renderTemplate(template, {
        ...notification.data,
        title: notification.title,
        message: notification.message,
      })

      // Send through appropriate channel
      switch (delivery.channel) {
        case DeliveryChannel.IN_APP:
          // In-app notifications are handled by the frontend
          delivery.status = DeliveryStatus.DELIVERED
          delivery.deliveredAt = new Date()
          break

        case DeliveryChannel.EMAIL:
          await this.sendEmailNotification(notification.userId, rendered.title, rendered.body)
          delivery.status = DeliveryStatus.SENT
          delivery.sentAt = new Date()
          break

        case DeliveryChannel.PUSH:
          await this.sendPushNotification(notification.userId, rendered.title, rendered.body)
          delivery.status = DeliveryStatus.SENT
          delivery.sentAt = new Date()
          break

        case DeliveryChannel.SMS:
          await this.sendSmsNotification(notification.userId, rendered.body)
          delivery.status = DeliveryStatus.SENT
          delivery.sentAt = new Date()
          break

        default:
          throw new Error(`Unsupported delivery channel: ${delivery.channel}`)
      }

      return this.deliveryRepository.save(delivery)
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id} via ${delivery.channel}: ${error.message}`,
        error.stack,
      )

      delivery.status = DeliveryStatus.FAILED
      delivery.errorMessage = error.message
      return this.deliveryRepository.save(delivery)
    }
  }

  private async sendEmailNotification(userId: string, subject: string, body: string): Promise<void> {
    // This is a placeholder for email integration
    // In a real implementation, you would integrate with your email service provider
    if (this.configService.get<string>("ENABLE_EMAIL_NOTIFICATIONS") !== "true") {
      throw new Error("Email notifications are disabled")
    }

    this.logger.log(`[EMAIL] To: ${userId}, Subject: ${subject}, Body: ${body}`)
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // This is a placeholder for push notification integration
    // In a real implementation, you would integrate with FCM, APNS, etc.
    if (this.configService.get<string>("ENABLE_PUSH_NOTIFICATIONS") !== "true") {
      throw new Error("Push notifications are disabled")
    }

    this.logger.log(`[PUSH] To: ${userId}, Title: ${title}, Body: ${body}`)
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async sendSmsNotification(userId: string, body: string): Promise<void> {
    // This is a placeholder for SMS integration
    // In a real implementation, you would integrate with Twilio, AWS SNS, etc.
    if (this.configService.get<string>("ENABLE_SMS_NOTIFICATIONS") !== "true") {
      throw new Error("SMS notifications are disabled")
    }

    this.logger.log(`[SMS] To: ${userId}, Body: ${body}`)
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
