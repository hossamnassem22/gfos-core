import { BaseEvent } from '../events/BaseEvent';
import { CommandContextManager } from '../context/CommandContext';
import { randomUUID } from 'crypto';

export class EventFactory {
  static create<T extends BaseEvent>(
    event: Omit<T, "eventId" | "timestamp" | "tenantId">
  ): T {
    // هنا نضمن أن الـ tenantId يأتي دائماً من السياق المحمي
    const tenantId = CommandContextManager.tenantId();
    
    if (!tenantId) {
      throw new Error("TENANT_ID_MISSING: Cannot create event outside of tenant context");
    }

    return {
      ...event,
      tenantId,
      eventId: randomUUID(),
      timestamp: Date.now(),
    } as T;
  }
}
