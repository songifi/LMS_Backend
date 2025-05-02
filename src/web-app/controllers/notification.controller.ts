import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() subscription: any, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.saveSubscription(subscription, userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('unsubscribe')
  async unsubscribe(@Body() data: { endpoint: string }, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.removeSubscription(data.endpoint, userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async updateSettings(@Body() settings: any, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.updateNotificationSettings(settings, userId);
  }
}