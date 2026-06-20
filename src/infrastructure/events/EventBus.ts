type EventHandler = (payload: any) => void;

const handlers: Record<string, EventHandler[]> = {};

export class EventBus {
  static on(event: string, handler: EventHandler) {
    if (!handlers[event]) handlers[event] = [];
    handlers[event].push(handler);
  }

  static emit(event: string, payload: any) {
    (handlers[event] || []).forEach(h => h(payload));
  }
}
