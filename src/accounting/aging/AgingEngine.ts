import { AccountStatement, LedgerEntry } from "../types.ts";
import { AgingProfile, AgingEngine } from "./types.ts";

export class AgingEngineImpl implements AgingEngine {
  buildProfile(customerId: string, statement: AccountStatement): AgingProfile {
    const buckets = { CURRENT: 0, D30_60: 0, D60_90: 0, D90_PLUS: 0 };
    let totalOverdue = 0;
    let oldestDebtDays = 0;

    const today = new Date();

    for (const entry of statement.entries) {
      const entryDate = new Date(entry.date);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (entry.direction === "DEBIT") {
        if (diffDays > 90) buckets.D90_PLUS += entry.amount;
        else if (diffDays > 60) buckets.D60_90 += entry.amount;
        else if (diffDays > 30) buckets.D30_60 += entry.amount;
        else buckets.CURRENT += entry.amount;

        if (diffDays > oldestDebtDays) oldestDebtDays = diffDays;
        if (diffDays > 30) totalOverdue += entry.amount;
      } else {
        // سداد جزئي (بسيط: نطرح من الأقدم أولاً)
        totalOverdue -= entry.amount;
      }
    }

    return {
      customerId,
      buckets,
      totalOverdue,
      oldestDebtDays,
      riskSignal: oldestDebtDays > 60 ? "HIGH" : "LOW"
    };
  }
}
