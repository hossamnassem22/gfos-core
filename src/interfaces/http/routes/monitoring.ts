import { Metrics } from "../../../infrastructure/observability/Metrics.ts";
import { AuditLogger } from "../../../infrastructure/observability/AuditLogger.ts";

export function monitoringRoutes(app: any) {
  app.get("/admin/metrics", () => Metrics.snapshot());

  app.get("/admin/audit", () => AuditLogger.list());
}
