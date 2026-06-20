export class EventBus {
  private handlers: Record<string, Array<(data: any) => void>> = {};

  subscribe(event: string, handler: (data: any) => void) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  publish(event: string, data: any) {
    this.handlers[event]?.forEach(h => h(data));
  }
}
