import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@User('id') userId: string): Promise<Notification[]> {
    return this.notificationsService.findAll(userId);
  }

  @Get('unread')
  getUnread(@User('id') userId: string): Promise<Notification[]> {
    return this.notificationsService.getUnreadNotifications(userId);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @User('id') userId: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('read-all')
  markAllAsRead(@User('id') userId: string): Promise<void> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('preferences/:type')
  getPreference(
    @User('id') userId: string,
    @Param('type') type: string,
  ): Promise<NotificationPreference> {
    return this.notificationsService.getPreferenceForUser(userId, type);
  }

  @Put('preferences')
  updatePreferences(
    @User('id') userId: string,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    return this.notificationsService.updatePreferences(userId, updateDto);
  }
}
