import { BaseEvent } from '../events/BaseEvent.ts';

export interface IEventStore {
  append(event: BaseEvent): Promise<void>;
  getEventsByTenant(tenantId: string): Promise<BaseEvent[]>;
}
