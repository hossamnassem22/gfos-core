import { BillingEngine } from "../core/BillingEngine.ts";
import { InvoiceRepository } from "../repository/InvoiceRepository.ts";

export class BillingFacade {
  constructor(private repo: InvoiceRepository) {}

  async processBilling(units: number) {
    const total = BillingEngine.calculateUsage(10, units);
    await this.repo.saveInvoice(total);
    return total;
  }
}
