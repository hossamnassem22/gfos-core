import { BillingRepository } from "../../core/ports/BillingRepository.ts";
import { BillingPolicy } from "../../core/billing/BillingPolicy.ts";

export class BillingService {
  constructor(private repo: BillingRepository) {}

  async checkRequestAllowed(tenantId: string) {
    const billing = await this.repo.get(tenantId);

    if (!billing) {
      throw new Error("Tenant billing not found");
    }

    BillingPolicy.checkRequestLimit(
      billing.plan,
      billing.requestsToday
    );

    billing.requestsToday += 1;
    await this.repo.save(billing);

    return true;
  }

  async checkUserCreationAllowed(tenantId: string) {
    const billing = await this.repo.get(tenantId);

    if (!billing) {
      throw new Error("Tenant billing not found");
    }

    BillingPolicy.checkUserLimit(
      billing.plan,
      billing.usersCount
    );

    return true;
  }
}
