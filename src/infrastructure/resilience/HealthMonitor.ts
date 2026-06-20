export class HealthMonitor {
  private static failures = 0;

  static recordFailure() {
    this.failures++;
  }

  static recordSuccess() {
    this.failures = 0;
  }

  static isHealthy(): boolean {
    return this.failures < 3;
  }

  static status() {
    return {
      healthy: this.isHealthy(),
      failures: this.failures,
    };
  }
}
