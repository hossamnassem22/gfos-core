export class LatencyAnalyzer {
  static analyze(responseTime: number) {
    if (responseTime > 2000) { // العتبة بالملي ثانية
      console.warn("[PERFORMANCE] Latency threshold exceeded: Triggering investigation.");
    }
  }
}
