import { TraceContext } from "../TraceContext.ts";

export class Span {
  static record(operation: string, duration: number) {
    const traceId = TraceContext.get();
    console.log(`[TRACE] Operation: ${operation} | TraceID: ${traceId} | Duration: ${duration}ms`);
  }
}
