import { Span } from "../span/Span.ts";

export class TraceDecorator {
  static async trace<T>(operation: string, action: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await action();
    } finally {
      const duration = performance.now() - start;
      Span.record(operation, duration);
    }
  }
}
