import { BillingRepository } from "../../core/ports/BillingRepository.ts";
import { TenantBilling } from "../../core/billing/TenantBilling.ts";

const db = new Map<string, TenantBilling>();

export class BillingRepositoryImpl implements BillingRepository {
  async get(tenantId: string) {
    return db.get(tenantId) || null;
  }

  async save(billing: TenantBilling) {
    db.set(billing.tenantId, billing);
    return billing;
  }
}
