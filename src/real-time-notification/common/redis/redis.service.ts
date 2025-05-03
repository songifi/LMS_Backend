import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      url: this.configService.get('REDIS_URL'),
    });
    this.subscriber = this.client.duplicate();
    this.publisher = this.client.duplicate();
  }

  async onModuleInit() {
    await this.client.connect();
    await this.subscriber.connect();
    await this.publisher.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel, callback);
  }

  async setPresence(userId: string, status: string): Promise<void> {
    await this.client.hSet('user_presence', userId, JSON.stringify({
      status,
      lastSeen: new Date().toISOString(),
    }));
    // Set expiry for presence data
    await this.client.expire('user_presence', 86400); // 24 hours
  }

  async getPresence(userId: string): Promise<any> {
    const presence = await this.client.hGet('user_presence', userId);
    return presence ? JSON.parse(presence) : null;
  }

  async setTyping(userId: string, channelId: string): Promise<void> {
    const key = `typing:${channelId}`;
    await this.client.hSet(key, userId, Date.now().toString());
    await this.client.expire(key, 10); // Expire after 10 seconds
  }

  async getTypingUsers(channelId: string): Promise<string[]> {
    const key = `typing:${channelId}`;
    const typing = await this.client.hGetAll(key);
    
    const now = Date.now();
    const activeTypers = [];
    
    for (const [userId, timestamp] of Object.entries(typing)) {
      if (now - parseInt(timestamp) < 5000) { // Active if typed in last 5 seconds
        activeTypers.push(userId);
      }
    }
    
    return activeTypers;
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await this.client.sAdd(`read:${userId}`, notificationId);
  }

  async isNotificationRead(userId: string, notificationId: string): Promise<boolean> {
    return await this.client.sIsMember(`read:${userId}`, notificationId);
  }
}