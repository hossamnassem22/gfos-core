export class MetricsCollector {
  record(name: string, value: number, labels: Record<string, string> = {}) {
    console.log(`[METRIC] ${name}: ${value}`);
  }
}
