import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PushNotificationPayload, PushProvider } from '../interfaces/push-provider.interface';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebasePushProvider implements PushProvider {
  private app: firebase.app.App;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    // Initialize Firebase Admin SDK
    this.app = firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
    });
  }

  async sendNotification(payload: PushNotificationPayload): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.userId },
      select: ['id', 'fcmToken'],
    });

    if (!user || !user.fcmToken) {
      return false;
    }

    try {
      await this.app.messaging().send({
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        android: {
          priority: 'high',
        },
      });
      return true;
    } catch (error) {
      console.error('Firebase push error:', error);
      return false;
    }
  }

  async isSupported(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'fcmToken'],
    });
    return Boolean(user?.fcmToken);
  }}