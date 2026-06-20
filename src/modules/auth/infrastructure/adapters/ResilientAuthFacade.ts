import { CircuitBreaker } from "../../../../core/resilience/circuit-breaker/CircuitBreaker.ts";
import { AuthFacade } from "../../application/AuthFacade.ts";

export class ResilientAuthFacade {
  constructor(
    private facade: AuthFacade,
    private breaker: CircuitBreaker
  ) {}

  async login(email: string, pass: string) {
    return await this.breaker.execute(() => this.facade.login(email, pass));
  }
}
