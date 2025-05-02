import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
import { NotificationSettings } from './entities/notification-settings.entity';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(PushSubscription)
    private subscriptionsRepository: Repository<PushSubscription>,
    @InjectRepository(NotificationSettings)
    private settingsRepository: Repository<NotificationSettings>
  ) {
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:admin@yourlms.com', // Contact email
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
  
  // Save a new push subscription
  async saveSubscription(subscription: any, userId: number) {
    try {
      // Check if subscription already exists
      const existing = await this.subscriptionsRepository.findOne({
        where: {
          endpoint: subscription.endpoint,
          user: { id: userId }
        }
      });
      
      if (existing) {
        // Update existing subscription
        existing.p256dh = subscription.keys.p256dh;
        existing.auth = subscription.keys.auth;
        existing.updatedAt = new Date();
        
        await this.subscriptionsRepository.save(existing);
        return { success: true, message: 'Subscription updated' };
      }
      
      // Create new subscription
      const newSubscription = this.subscriptionsRepository.create({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user: { id: userId },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await this.subscriptionsRepository.save(newSubscription);
      
      // Ensure user has notification settings
      await this.ensureNotificationSettings(userId);
      
      return { success: true, message: 'Subscription saved' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Remove a push subscription
  async removeSubscription(endpoint: string, userId: number) {
    try {
      await this.subscriptionsRepository.delete({
        endpoint,
        user: { id: userId }
      });
      
      return { success: true, message: 'Subscription removed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Update notification settings
  async updateNotificationSettings(settings: any, userId: number) {
    try {
      let userSettings = await this.settingsRepository.findOne({
        where: { user: { id: userId } }
      });
      
      if (!userSettings) {
        userSettings = this.settingsRepository.create({
          user: { id: userId }
        });
      }
      
      // Update settings
      userSettings.assignmentReminders = settings.assignmentReminders ?? userSettings.assignmentReminders;
      userSettings.courseUpdates = settings.courseUpdates ?? userSettings.courseUpdates;
      userSettings.discussionReplies = settings.discussionReplies ?? userSettings.discussionReplies;
      userSettings.gradePosted = settings.gradePosted ?? userSettings.gradePosted;
      userSettings.updatedAt = new Date();
      
      await this.settingsRepository.save(userSettings);
      
      return { success: true, settings: userSettings };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Ensure user has notification settings
  private async ensureNotificationSettings(userId: number) {
    const settings = await this.settingsRepository.findOne({
      where: { user: { id: userId } }
    });
    
    if (!settings) {
      // Create default settings
      const defaultSettings = this.settingsRepository.create({
        user: { id: userId },
        assignmentReminders: true,
        courseUpdates: true,
        discussionReplies: true,
        gradePosted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await this.settingsRepository.save(defaultSettings);
    }
  }
  
  // Send notification to a specific user
  async sendNotificationToUser(userId: number, notification: any) {
    try {
      // Get user's subscriptions
      const subscriptions = await this.subscriptionsRepository.find({
        where: { user: { id: userId } }
      });
      
      if (subscriptions.length === 0) {
        return { success: false, message: 'No subscriptions found for user' };
      }
      
      // Get user's notification settings
      const settings = await this.settingsRepository.findOne({
        where: { user: { id: userId } }
      });
      
      // Check if user wants this type of notification
      if (settings) {
        if (
          (notification.type === 'assignment' && !settings.assignmentReminders) ||
          (notification.type === 'course' && !settings.courseUpdates) ||
          (notification.type === 'discussion' && !settings.discussionReplies) ||
          (notification.type === 'grade' && !settings.gradePosted)
        ) {
          return { success: false, message: 'User has disabled this notification type' };
        }
      }
      
      // Send to all user's subscriptions
      const results = await Promise.all(
        subscriptions.map(async subscription => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth
                }
              },
              JSON.stringify(notification)
            );
            
            return { success: true, endpoint: subscription.endpoint };
          } catch (error) {
            // If subscription is invalid, remove it
            if (error.statusCode === 404 || error.statusCode === 410) {
              await this.subscriptionsRepository.delete(subscription.id);
            }
            
            return { success: false, endpoint: subscription.endpoint, error: error.message };
          }
        })
      );
      
      return { success: true, results };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Send notification to users based on criteria
  async sendNotificationByCriteria(criteria: any, notification: any) {
    // Implementation details...
  }
}