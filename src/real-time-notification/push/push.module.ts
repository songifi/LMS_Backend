import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { FirebasePushProvider } from './providers/firebase-push.provider';
import { ApplePushProvider } from './providers/apple-push.provider';

@Module({
  providers: [PushService, FirebasePushProvider, ApplePushProvider],
  exports: [PushService],
})
export class PushModule {}