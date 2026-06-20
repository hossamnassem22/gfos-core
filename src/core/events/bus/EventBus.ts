export type EventHandler<T> = (data: T) => Promise<void>;

export class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T>(event: string, handler: EventHandler<T>) {
    const subs = this.handlers.get(event) || [];
    subs.push(handler);
    this.handlers.set(event, subs);
  }

  async publish(event: string, data: any) {
    const subs = this.handlers.get(event) || [];
    // تنفيذ متوازٍ مع معالجة الأخطاء لكل مشترك لضمان استقرار الناقل
    await Promise.all(subs.map(h => h(data).catch(console.error)));
  }
}
