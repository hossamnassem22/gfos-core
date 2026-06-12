import { SettlementEngine } from "./application/services/SettlementEngine.ts";
import { TransactionEngine } from "./application/services/TransactionEngine.ts";
import { AuditEngine } from "./infrastructure/audit/AuditEngine.ts";
import { StorageEngine } from "./infrastructure/persistence/StorageEngine.ts";

export class Kernel {
  constructor(private txEngine: TransactionEngine) {}

  public async processPayment(payment: any, claims: any[]) {
    const plan = SettlementEngine.processWaterfall(payment, claims);
    const entries = this.txEngine.execute(plan);
    
    for (const entry of entries) {
      // 1. التوثيق (Audit)
      await AuditEngine.log(entry);
      // 2. الحفظ الدائم (Persistence)
      await StorageEngine.saveJournalEntry(entry);
    }
  }
}
