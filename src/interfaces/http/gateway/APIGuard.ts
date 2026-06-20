import { RateLimiter } from "../../../core/gateway/RateLimiter.ts";
import { UserContext } from "../../../core/context/UserContext.ts";
import { TenantContext } from "../../../core/context/TenantContext.ts";

export class APIGuard {
  static preHandle(req: any) {
    const ip = req.ip || "unknown";

    // Rate limit per IP
    RateLimiter.check(ip, 100, 60_000);

    // Set contexts (from auth layer later)
    if (req.user) {
      UserContext.set(req.user);
      TenantContext.set(req.user.tenantId);
    }

    return {
      requestId: crypto.randomUUID(),
      ip,
      path: req.url,
      method: req.method,
    };
  }
}
