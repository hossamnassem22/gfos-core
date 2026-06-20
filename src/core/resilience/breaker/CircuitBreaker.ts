import { TraceDecorator } from "@core/telemetry/tracing/decorator/TraceDecorator.ts";

export enum State { CLOSED, OPEN, HALF_OPEN }

export class CircuitBreaker {
  private state = State.CLOSED;
  private failures = 0;

  async execute<T>(name: string, action: () => Promise<T>): Promise<T> {
    if (this.state === State.OPEN) throw new Error("Circuit Breaking: Service Unavailable");
    
    return await TraceDecorator.trace(name, async () => {
      try {
        const result = await action();
        this.failures = 0;
        return result;
      } catch (e) {
        this.failures++;
        if (this.failures > 3) this.state = State.OPEN;
        throw e;
      }
    });
  }
}
