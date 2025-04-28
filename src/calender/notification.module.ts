import { Module } from '@nestjs/common';
import { NotificationService } from './providers/notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
