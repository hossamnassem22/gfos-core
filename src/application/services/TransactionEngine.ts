import { Money } from "@domain/ledger/Money.ts";
import { SettlementPlan } from "@domain/settlement/SettlementPlan.ts";
import { JournalEntry, EntryType } from "@kernel/ledger/JournalEntry.ts";
​export class TransactionEngine {
execute(plan: SettlementPlan): JournalEntry[] {
const entries: JournalEntry[] = [];
plan.allocations.forEach(alloc => {
entries.push(new JournalEntry(alloc.account, EntryType.DEBIT, alloc.amount));
});
return entries;
}
}
