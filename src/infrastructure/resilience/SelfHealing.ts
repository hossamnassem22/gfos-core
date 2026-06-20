import { CircuitBreaker } from "./CircuitBreaker.ts";
import { retry } from "./Retry.ts";
import { HealthMonitor } from "./HealthMonitor.ts";

const breaker = new CircuitBreaker();

export class SelfHealing {
  static async call<T>(fn: () => Promise<T>): Promise<T> {
    return breaker.exec(async () => {
      return retry(async () => {
        try {
          const result = await fn();
          HealthMonitor.recordSuccess();
          return result;
        } catch (err) {
          HealthMonitor.recordFailure();
          throw err;
        }
      });
    });
  }
}
