import { TenantBilling } from "../billing/TenantBilling.ts";

export interface BillingRepository {
  get(tenantId: string): Promise<TenantBilling | null>;
  save(billing: TenantBilling): Promise<TenantBilling>;
}
