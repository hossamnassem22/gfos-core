export class TenantContext {
  private static currentTenantId: string | null = null;

  static set(tenantId: string) {
    this.currentTenantId = tenantId;
  }

  static get(): string {
    if (!this.currentTenantId) throw new Error("[SECURITY] No tenant context found");
    return this.currentTenantId;
  }
}
