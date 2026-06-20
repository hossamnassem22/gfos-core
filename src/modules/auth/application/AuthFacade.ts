import { MetricsCollector } from "@core/telemetry/MetricsCollector.ts";
import { AuditLogger } from "@core/security/audit/AuditLogger.ts";

export class AuthFacade {
  constructor(
    private metrics: MetricsCollector,
    private audit: AuditLogger
  ) {}

  async login(email: string) {
    this.metrics.record("login_attempt", 1);
    this.audit.log({
      timestamp: new Date().toISOString(),
      action: "user_login",
      actor: email,
      target: "system",
      status: "success"
    });
    return { status: "success", user: email };
  }
}
