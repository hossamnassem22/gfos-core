import { BaseException } from "../BaseException.ts";
import { MetricsCollector } from "../../telemetry/MetricsCollector.ts";
import { EventBus } from "../../events/EventBus.ts";

export class GlobalErrorHandler {
  constructor(
    private metrics: MetricsCollector,
    private eventBus: EventBus
  ) {}

  async handle(error: Error) {
    const isBase = error instanceof BaseException;
    const code = isBase ? (error as BaseException).code : "INTERNAL_SERVER_ERROR";
    
    // تسجيل المقياس
    this.metrics.record("error_count", 1, { code });

    // بث حدث الخطأ للمراقبة
    await this.eventBus.publish({
      name: "SystemError",
      payload: { code, message: error.message },
      timestamp: new Date()
    });
    
    console.error(`[CRITICAL ERROR] ${code}: ${error.message}`);
  }
}
