import { DomainEvent } from "../../domain/events/DomainEvent.ts";

export class EventStore {
  private events: DomainEvent[] = [];

  append(event: DomainEvent) {
    this.events.push(event);
  }

  getByAggregate(aggregateId: string) {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  getAll() {
    return [...this.events];
  }
}
