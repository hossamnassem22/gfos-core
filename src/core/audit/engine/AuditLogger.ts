import { AuditEvent } from "../models/AuditEvent.ts";

export class AuditLogger {
  static async log(event: AuditEvent) {
    const logEntry = { ...event, timestamp: new Date().toISOString() };
    // في الإنتاج، يتم إرسال هذا السجل إلى خدمة تخزين خارجية (مثل SIEM أو CloudWatch)
    console.log(`[AUDIT_TRAIL] ${JSON.stringify(logEntry)}`);
  }
}
