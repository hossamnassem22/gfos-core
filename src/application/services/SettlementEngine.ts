import { Claim } from "../../domain/settlement/Claim.ts";
import { Money } from "../ledger/Money.ts";

export class SettlementEngine {
  public static processWaterfall(totalPayment: Money, claims: Claim[]): Map<string, Money> {
    const sortedClaims = [...claims].sort((a, b) => a.priority - b.priority);
    const results = new Map<string, Money>();
    let remainingCents = totalPayment.cents;

    for (const claim of sortedClaims) {
      if (remainingCents <= 0n) break;
      // تنفيذ منطق توزيع الحصص بناءً على الـ Rule
    }
    return results;
  }
}
