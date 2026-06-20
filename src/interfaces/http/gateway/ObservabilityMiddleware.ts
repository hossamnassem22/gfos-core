import { TraceContext } from "../../../infrastructure/observability/TraceContext.ts";
import { Metrics } from "../../../infrastructure/observability/Metrics.ts";
import { AuditLogger } from "../../../infrastructure/observability/AuditLogger.ts";

export class ObservabilityMiddleware {
  static async wrap(req: any, handler: Function) {
    const start = Date.now();
    const traceId = TraceContext.start();

    try {
      const result = await handler(req);

      Metrics.recordRequest(Date.now() - start);

      AuditLogger.log({
        tenantId: req.user?.tenantId || "anonymous",
        userId: req.user?.userId || "anonymous",
        action: req.method,
        resource: req.url,
        timestamp: new Date(),
      });

      return result;
    } catch (e) {
      Metrics.recordError();
      throw e;
    } finally {
      console.log("[TRACE]", traceId);
      TraceContext.clear();
    }
  }
}
