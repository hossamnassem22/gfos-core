import { Metric } from "../models/Metric.ts";

export class MetricsCollector {
  private buffer: Metric[] = [];

  record(metric: Metric) {
    this.buffer.push(metric);
    // منطق التجميع (Batch Processing) يقلل من حمل الشبكة
    if (this.buffer.length >= 100) this.flush();
  }

  private flush() {
    console.log(`[METRICS] Flushing ${this.buffer.length} metrics to storage...`);
    this.buffer = [];
  }
}
