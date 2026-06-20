import { TenantContext } from "../TenantContext.ts";

export class TenantGuard {
  static applyIsolation(query: string): string {
    const tenantId = TenantContext.get();
    // إلحاق شرط العزل تلقائياً بكل استعلام (Policy Enforcement)
    return `${query} WHERE tenant_id = '${tenantId}'`;
  }
}
