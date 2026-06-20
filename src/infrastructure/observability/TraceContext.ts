export class TraceContext {
  private static traceId: string | null = null;

  static start() {
    this.traceId = crypto.randomUUID();
    return this.traceId;
  }

  static get() {
    if (!this.traceId) {
      throw new Error("Trace not initialized");
    }
    return this.traceId;
  }

  static clear() {
    this.traceId = null;
  }
}
