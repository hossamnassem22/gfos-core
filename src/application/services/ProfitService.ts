import { Money } from "../../domain/ledger/Money.ts";
import { AuditLogger } from "../infrastructure/audit/AuditLogger.ts";

export class ProfitService {
  static async calculateAndDistribute(userId: string, balance: Money, profitRate: number): Promise<Money> {
    // حساب الربح
    const profitAmount = (balance.cents * BigInt(Math.floor(profitRate * 100))) / 10000n;
    const profit = new Money(profitAmount, balance.currency);

    // التوثيق في السجل مع ذكر العملة
    await AuditLogger.log(userId, "PROFIT_DISTRIBUTION", 
      `تم توزيع ربح قدره ${profit.cents} ${profit.currency} (نسبة ${profitRate}%)`);
    
    return profit;
  }
}
