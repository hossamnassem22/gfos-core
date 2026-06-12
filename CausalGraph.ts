import { CanonicalEvent, EventId } from "./CanonicalEvent";
export class CausalGraph {
  private readonly nodes = new Map<EventId, CanonicalEvent>();
  add(event: CanonicalEvent): void {
    if (this.nodes.has(event.id)) return;
    for (const pid of event.parentIds) { if (!this.nodes.has(pid)) throw new Error(`Orphan: ${event.id}`); }
    this.nodes.set(event.id, event);
  }
  get(id: EventId): CanonicalEvent | undefined { return this.nodes.get(id); }
  events(): IterableIterator<CanonicalEvent> { return this.nodes.values(); }
}
