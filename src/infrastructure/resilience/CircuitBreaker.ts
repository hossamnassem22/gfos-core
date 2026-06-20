type State = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private failures = 0;
  private state: State = "CLOSED";
  private lastFailureTime = 0;

  constructor(
    private threshold = 5,
    private resetTimeoutMs = 10000
  ) {}

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit OPEN");
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = "OPEN";
    }
  }

  private reset() {
    this.failures = 0;
    this.state = "CLOSED";
  }
}
