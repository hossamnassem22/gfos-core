export interface IEventStore {
  save(event: any): void;
}

export class InMemoryEventStore implements IEventStore {
  save(event: any) { console.log("Saved", event); }
}
