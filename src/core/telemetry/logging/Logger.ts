import { LogSanitizer } from "@core/security/compliance/LogSanitizer.ts";

export interface Logger {
  info(message: string, context?: Record<string, any>): void;
}

export class ConsoleLogger implements Logger {
  info(message: string, context: Record<string, any> = {}) {
    // تطبيق الفلترة قبل التسجيل
    const safeContext = LogSanitizer.sanitize(context);
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, JSON.stringify(safeContext));
  }
}
