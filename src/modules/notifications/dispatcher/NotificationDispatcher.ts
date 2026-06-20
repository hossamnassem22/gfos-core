import { Notification } from "../models/Notification.ts";

export class NotificationDispatcher {
  async dispatch(notification: Notification) {
    console.log(`[NOTIFICATION] Dispatching to ${notification.channel}:`, {
      to: notification.recipientId,
      template: notification.templateId,
      timestamp: new Date().toISOString()
    });
    // التكامل مع مزود الخدمة الخارجي يتم هنا
  }
}
