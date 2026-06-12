import { AuditLogger } from "../audit/AuditLogger.ts";

export class NotificationWorker {
  constructor(private kv: Deno.Kv) {}

  async processPendingNotifications(): Promise<void> {
    const iter = this.kv.list({ prefix: ["notifications"] });

    for await (const entry of iter) {
      const notification = entry.value as { status: string, userId: string, message: string };

      if (notification.status === "PENDING") {
        console.log(`[WORKER]: Sending to ${notification.userId}: ${notification.message}`);

        const update = { ...notification, status: "SENT" };
        await this.kv.set(entry.key, update);

        await AuditLogger.log(notification.userId, "NOTIFICATION_SENT", "تم إرسال التنبيه بنجاح");
      }
    }
  }
}
