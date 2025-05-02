export interface PushNotificationPayload {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }
  
  export interface PushProvider {
    sendNotification(payload: PushNotificationPayload): Promise<boolean>;
    isSupported(userId: string): Promise<boolean>;
  }