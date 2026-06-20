import { MetricsCollector } from "./MetricsCollector.ts";

export class ConsoleMetricsCollector implements MetricsCollector {
  recordLatency(operation: string, duration: number): void {
    // استخدام دقة زمنية بالملي ثانية وفق المعايير الإحصائية للقياس
    console.info(`[METRIC] Op: ${operation} | Duration: ${duration.toFixed(2)}ms`);
  }

  recordError(operation: string, error: Error): void {
    // توثيق الخطأ مع السياق الزمني (Contextual Logging)
    console.error(`[ERROR] Op: ${operation} | Message: ${error.message}`);
  }
}
