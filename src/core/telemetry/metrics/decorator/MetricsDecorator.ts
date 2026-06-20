import { MetricsCollector } from "../collector/MetricsCollector.ts";

export class MetricsDecorator {
  constructor(private collector: MetricsCollector) {}

  async observe<T>(name: string, action: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await action();
    } finally {
      const duration = performance.now() - start;
      this.collector.record({ name, value: duration, labels: {}, timestamp: new Date().toISOString() });
    }
  }
}
