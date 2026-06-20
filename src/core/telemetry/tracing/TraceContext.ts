export class TraceContext {
  private static traceId: string | null = null;

  static start() {
    this.traceId = crypto.randomUUID();
  }

  static get(): string | null {
    return this.traceId;
  }
}
