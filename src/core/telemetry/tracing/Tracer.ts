export class Tracer {
  startSpan(name: string) {
    const traceId = crypto.randomUUID();
    console.log(`[TRACE] Starting span: ${name} (TraceID: ${traceId})`);
    return traceId;
  }
}
