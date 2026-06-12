import { Money } from "../domain/ledger/Money.ts";
import { AuditLogger } from "../infrastructure/audit/AuditLogger.ts";

export class ExchangeService {
  static async exchange(money: Money, targetCode: string): Promise<Money> {
    const converted = money.convertTo(targetCode);
    
    // توثيق العملية للشفافية المالية
    await AuditLogger.log("SYSTEM", "CURRENCY_EXCHANGE", 
      `تحويل من ${money.currency} إلى ${targetCode} بسعر صرف مدروس.`);
      
    return converted;
  }
}
