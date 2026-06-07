import { BaseEvent } from '../events/BaseEvent';
import { IEventStore } from './EventStore';

export class InMemoryEventStore implements IEventStore {
  private events: BaseEvent[] = [];

  async append(event: BaseEvent): Promise<void> {
    // التحقق النهائي قبل التخزين
    if (!event.tenantId) {
      throw new Error("SECURITY_VIOLATION: Cannot append event without tenantId");
    }
    this.events.push(event);
  }

  async getEventsByTenant(tenantId: string): Promise<BaseEvent[]> {
    // فرض العزل عند الاسترجاع (Tenant-Scoped Query)
    return this.events.filter(e => e.tenantId === tenantId);
  }
}
