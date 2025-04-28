import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { NotificationController } from "./controllers/notification.controller"
import { NotificationService } from "./providers/notification.service"
import { Notification } from "./entities/notification.entity"
import { NotificationType } from "./entities/notification-type.entity"
import { NotificationTemplate } from "./entities/notification-template.entity"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { NotificationDelivery } from "./entities/notification-delivery.entity"
import { NotificationPreferenceController } from "./controllers/notification-preference.controller"
import { NotificationTemplateService } from "./providers/notification-template.service"
import { NotificationPreferenceService } from "./providers/notification-preference.service"
import { NotificationDeliveryService } from "./providers/notification-delivery.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationType,
      NotificationTemplate,
      NotificationPreference,
      NotificationDelivery,
    ]),
    ConfigModule,
  ],
  controllers: [NotificationController, NotificationPreferenceController],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationDeliveryService,
  ],
  exports: [NotificationService, NotificationPreferenceService],
})
export class NotificationModule {}
