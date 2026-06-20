export class TenantContext {
  private static currentTenantId: string | null = null;

  static setTenant(id: string) {
    this.currentTenantId = id;
  }

  static getTenant() {
    if (!this.currentTenantId) {
      throw new Error("Tenant not set");
    }
    return this.currentTenantId;
  }

  static clear() {
    this.currentTenantId = null;
  }
}
