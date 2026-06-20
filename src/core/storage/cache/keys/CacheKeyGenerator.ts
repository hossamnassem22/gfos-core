import { TenantContext } from "@core/tenant/TenantContext.ts";

export class CacheKeyGenerator {
  static generate(scope: string, identifier: string): string {
    const tenantId = TenantContext.get();
    return `cache:${tenantId}:${scope}:${identifier}`;
  }
}
