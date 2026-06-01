import { DomainEvent } from "../../domain/events/DomainEvent.ts";

export class TransactionEngine {
  async execute(
    _tenantId: string,
    _aggregateId: string,
    steps: (() => DomainEvent)[],
  ): Promise<void> {
    for (const step of steps) {
      step();
    }
    await Promise.resolve();
  }
}
