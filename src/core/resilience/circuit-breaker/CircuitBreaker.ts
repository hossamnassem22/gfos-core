export enum State { CLOSED, OPEN, HALF_OPEN }

export class CircuitBreaker {
  private state = State.CLOSED;
  private failures = 0;
  private readonly threshold = 3;

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === State.OPEN) {
      throw new Error("[RESILIENCE] Circuit is OPEN. Request rejected.");
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = State.OPEN;
    }
  }

  private reset() {
    this.failures = 0;
    this.state = State.CLOSED;
  }
}
