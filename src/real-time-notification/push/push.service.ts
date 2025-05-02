import { Injectable } from '@nestjs/common';
import { FirebasePushProvider } from './providers/firebase-push.provider';
import { ApplePushProvider } from './providers/apple-push.provider';
import { PushNotificationPayload } from './interfaces/push-provider.interface';

@Injectable()
export class PushService {
  constructor(
    private firebasePushProvider: FirebasePushProvider,
    private applePushProvider: ApplePushProvider,
  ) {}

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    // Try to send via Firebase first
    if (await this.firebasePushProvider.isSupported(payload.userId)) {
      const sent = await this.firebasePushProvider.sendNotification(payload);
      if (sent) return true;
    }

    // Try Apple if Firebase fails or not supported
    if (await this.applePushProvider.isSupported(payload.userId)) {
      return await this.applePushProvider.sendNotification(payload);
    }

    return false;
  }
}