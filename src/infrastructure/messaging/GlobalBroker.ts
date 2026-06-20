type Handler = (event: any) => void;

const topics: Record<string, Handler[]> = {};

export class GlobalBroker {
  static publish(topic: string, event: any) {
    (topics[topic] || []).forEach(h => h(event));
  }

  static subscribe(topic: string, handler: Handler) {
    if (!topics[topic]) topics[topic] = [];
    topics[topic].push(handler);
  }
}
