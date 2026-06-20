import { CircuitBreaker } from "../breaker/CircuitBreaker.ts";

export class ExternalGateway {
  private breaker = new CircuitBreaker();

  async callService(serviceName: string, request: () => Promise<any>) {
    return await this.breaker.execute(serviceName, request);
  }
}
