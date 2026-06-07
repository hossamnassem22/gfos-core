export interface BaseEvent {
  eventId: string;
  timestamp: number;
  tenantId: string;
  type: string;
  version: number;
}
