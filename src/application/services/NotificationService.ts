import { AuditLogger } from "../infrastructure/audit/AuditLogger.ts";

export class NotificationService {
  static async notify(userId: string, action: string, message: string) {
    // 1. التوثيق (قبل الإرسال)
    await AuditLogger.log(userId, action, message);
    
    // 2. التنبيه (الإرسال)
    console.log(`[SYSTEM ALERT]: To ${userId} -> ${message}`);
  }
}
