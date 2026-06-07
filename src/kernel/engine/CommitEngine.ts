const processedEvents = new Set<string>();

export class CommitEngine {
  static async commit(eventId: string, action: () => Promise<void>) {
    if (processedEvents.has(eventId)) {
      console.warn(`[SKIP]: الحدث ${eventId} تم معالجته مسبقاً.`);
      return;
    }
    await action();
    processedEvents.add(eventId);
  }
}
