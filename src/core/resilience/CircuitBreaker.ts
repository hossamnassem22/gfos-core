export enum CircuitState { CLOSED, OPEN, HALF_OPEN }

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private threshold = 3;

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) throw new Error("Circuit is OPEN");
    try {
      const result = await action();
      this.reset();
      return result;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.threshold) this.state = CircuitState.OPEN;
      throw e;
    }
  }

  private reset() { this.failures = 0; this.state = CircuitState.CLOSED; }
}
