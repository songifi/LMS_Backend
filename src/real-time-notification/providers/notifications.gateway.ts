import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    WsResponse,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UseGuards } from '@nestjs/common';
  import { WsAuthGuard } from '../common/auth/ws-auth.guard';
  import { NotificationsService } from './notifications.service';
  import { PresenceService } from '../presence/presence.service';
  import { RedisService } from '../common/redis/redis.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
    namespace: 'notifications',
  })
  @UseGuards(WsAuthGuard)
  export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private notificationsService: NotificationsService,
      private presenceService: PresenceService,
      private redisService: RedisService,
    ) {
      // Subscribe to the Redis notification channel
      this.redisService.subscribe('notifications', this.handleRedisNotification.bind(this));
    }
  
    private handleRedisNotification(message: string) {
      try {
        const notification = JSON.parse(message);
        // Emit to specific user's room
        this.server.to(`user:${notification.recipientId}`).emit('notification', notification);
      } catch (err) {
        console.error('Failed to handle Redis notification:', err);
      }
    }
  
    async handleConnection(client: Socket) {
      try {
        const user = client.data.user;
        
        // Join user-specific room
        client.join(`user:${user.id}`);
        
        // Update user presence
        await this.presenceService.setUserOnline(user.id);
        
        // Notify other users about this user's online status
        this.server.emit('presenceUpdate', { userId: user.id, status: 'online' });
        
        // Send unread notifications
        const unread = await this.notificationsService.getUnreadNotifications(user.id);
        client.emit('unreadNotifications', unread);
      } catch (err) {
        client.disconnect();
      }
    }
  
    async handleDisconnect(client: Socket) {
      try {
        const user = client.data.user;
        if (user) {
          // Update user presence
          await this.presenceService.setUserOffline(user.id);
          
          // Notify other users about this user's offline status
          this.server.emit('presenceUpdate', { userId: user.id, status: 'offline' });
        }
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    }
  
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string },
    ): Promise<WsResponse<any>> {
      client.join(`room:${data.roomId}`);
      return { event: 'joinedRoom', data: { roomId: data.roomId } };
    }
  
    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string },
    ): Promise<WsResponse<any>> {
      client.leave(`room:${data.roomId}`);
      return { event: 'leftRoom', data: { roomId: data.roomId } };
    }
  
    @SubscribeMessage('typing')
    async handleTyping(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { channelId: string, isTyping: boolean },
    ): Promise<void> {
      const user = client.data.user;
      
      if (data.isTyping) {
        await this.redisService.setTyping(user.id, data.channelId);
      }
      
      // Get all currently typing users and broadcast
      const typingUsers = await this.redisService.getTypingUsers(data.channelId);
      this.server.to(`room:${data.channelId}`).emit('typingUpdate', {
        channelId: data.channelId,
        users: typingUsers,
      });
    }
  
    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { notificationId: string },
    ): Promise<WsResponse<any>> {
      const user = client.data.user;
      await this.notificationsService.markAsRead(data.notificationId, user.id);
      
      // Broadcast read receipt
      this.server.to(`notification:${data.notificationId}`).emit('readReceipt', {
        notificationId: data.notificationId,
        userId: user.id,
        readAt: new Date().toISOString(),
      });
      
      return { event: 'markedAsRead', data: { notificationId: data.notificationId } };
    }
  }
  