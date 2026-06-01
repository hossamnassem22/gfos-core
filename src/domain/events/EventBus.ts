export interface EventHandler<T = unknown> {
  handle(event: T): void;
}

export class EventBus {
  private handlers: EventHandler<unknown>[] = [];

  register(handler: EventHandler<unknown>): void {
    this.handlers.push(handler);
  }

  publish(event: unknown): void {
    for (const handler of this.handlers) {
      handler.handle(event);
    }
  }
}
	

