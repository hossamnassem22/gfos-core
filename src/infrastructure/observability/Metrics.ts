const metrics = {
  requests: 0,
  errors: 0,
  latency: [] as number[],
};

export class Metrics {
  static recordRequest(latencyMs: number) {
    metrics.requests++;
    metrics.latency.push(latencyMs);
  }

  static recordError() {
    metrics.errors++;
  }

  static snapshot() {
    return {
      ...metrics,
      avgLatency:
        metrics.latency.reduce((a, b) => a + b, 0) /
        (metrics.latency.length || 1),
    };
  }
}
