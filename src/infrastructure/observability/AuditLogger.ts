import { TraceContext } from "./TraceContext.ts";

type AuditEvent = {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: any;
  traceId: string;
};

const logs: AuditEvent[] = [];

export class AuditLogger {
  static log(event: Omit<AuditEvent, "traceId">) {
    const fullEvent: AuditEvent = {
      ...event,
      traceId: TraceContext.get(),
    };

    logs.push(fullEvent);

    console.log("[AUDIT]", JSON.stringify(fullEvent));
  }

  static list() {
    return logs;
  }
}
