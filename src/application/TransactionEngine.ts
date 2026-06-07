import { JournalEntry, EntryType } from "@kernel/ledger/JournalEntry.ts";
import { SettlementPlan } from "@domain/settlement/SettlementPlan.ts";

export class TransactionEngine {
  process(plan: SettlementPlan): JournalEntry[] {
    // نستخدم النوع الرسمي plan.amount بناءً على تعريف SettlementPlan
    return [
      new JournalEntry("CASH", EntryType.DEBIT, plan.amount),
      new JournalEntry("RECEIVABLE", EntryType.CREDIT, plan.amount)
    ];
  }
}
