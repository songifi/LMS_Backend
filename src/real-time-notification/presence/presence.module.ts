import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Module({
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}

// src/presence/presence.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class PresenceService {
  constructor(private redisService: RedisService) {}

  async setUserOnline(userId: string): Promise<void> {
    await this.redisService.setPresence(userId, 'online');
    await this.redisService.publish('presence', JSON.stringify({
      userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    }));
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.redisService.setPresence(userId, 'offline');
    await this.redisService.publish('presence', JSON.stringify({
      userId,
      status: 'offline',
      timestamp: new Date().toISOString(),
    }));
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const presence = await this.redisService.getPresence(userId);
    return presence && presence.status === 'online';
  }

  async getUserPresence(userId: string): Promise<{ status: string; lastSeen: string }> {
    const presence = await this.redisService.getPresence(userId);
    return presence || { status: 'offline', lastSeen: null };
  }

  async getOnlineUsers(): Promise<Record<string, { status: string; lastSeen: string }>> {
    const client = this.redisService.getClient();
    const userIds = await client.hKeys('user_presence');
    
    const result: Record<string, { status: string; lastSeen: string }> = {};
    
    for (const userId of userIds) {
      const presence = await this.redisService.getPresence(userId);
      if (presence) {
        result[userId] = presence;
      }
    }
    
    return result;
  }
}