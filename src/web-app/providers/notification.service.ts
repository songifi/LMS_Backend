
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your key
  
  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) {}
  
  // Request permission and subscribe to push notifications
  async subscribeToPushNotifications() {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }
      
      // Subscribe via service worker
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });
      
      // Send subscription to server
      await this.http.post('/api/notifications/subscribe', subscription).toPromise();
      
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }
  
  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications() {
    try {
      const subscription = await this.swPush.subscription.toPromise();
      
      if (subscription) {
        // Unsubscribe from service worker push
        await subscription.unsubscribe();
        
        // Notify server
        await this.http.post('/api/notifications/unsubscribe', { endpoint: subscription.endpoint }).toPromise();
      }
      
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }
  
  // Listen for push notifications
  listenForPushNotifications() {
    return this.swPush.notificationClicks;
  }
  
  // Check if push notifications are supported
  isPushNotificationSupported(): boolean {
    return ('serviceWorker' in navigator) && ('PushManager' in window);
  }
  
  // Get current notification permission
  getNotificationPermission(): string {
    return Notification.permission;
  }
}