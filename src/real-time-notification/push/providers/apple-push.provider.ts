import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PushNotificationPayload, PushProvider } from '../interfaces/push-provider.interface';
import * as apn from 'apn';

@Injectable()
export class ApplePushProvider implements PushProvider {
  private provider: apn.Provider;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    // Initialize Apple Push Notification Service
    this.provider = new apn.Provider({
      token: {
        key: this.configService.get('APN_KEY_PATH'),
        keyId: this.configService.get('APN_KEY_ID'),
        teamId: this.configService.get('APN_TEAM_ID'),
      },
      production: this.configService.get('NODE_ENV') === 'production',
    });
  }

  async sendNotification(payload: PushNotificationPayload): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.userId },
      select: ['id', 'apnToken'],
    });

    if (!user || !user.apnToken) {
      return false;
    }

    try {
      const notification = new apn.Notification();
      notification.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      notification.badge = 1;
      notification.sound = 'ping.aiff';
      notification.alert = {
        title: payload.title,
        body: payload.body,
      };
      notification.payload = payload.data || {};
      notification.topic = this.configService.get('APN_BUNDLE_ID');

      const result = await this.provider.send(notification, user.apnToken);
      return result.sent.length > 0;
    } catch (error) {
      console.error('Apple push error:', error);
      return false;
    }
  }

  async isSupported(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'apnToken'],
    });
    return Boolean(user?.apnToken);
  }
}
