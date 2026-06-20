import { TenantContext } from "@core/tenant/TenantContext.ts";

export class InvoiceRepository {
  async saveInvoice(amount: number) {
    const tenantId = TenantContext.get();
    console.log(`[BILLING] Saving invoice for tenant: ${tenantId} | Amount: ${amount}`);
    // منطق الحفظ في قاعدة البيانات سيتم ربطه لاحقاً
  }
}
