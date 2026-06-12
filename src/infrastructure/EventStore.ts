import { BaseEvent } from '../events/BaseEvent';

export interface IEventStore {
  append(event: BaseEvent): Promise<void>;
  getEventsByTenant(tenantId: string): Promise<BaseEvent[]>;
}
