import { JournalEntry } from "@kernel/ledger/JournalEntry.ts";

export class TransactionService {
  execute(journal: JournalEntry): void {
    if (!journal.isBalanced()) {
      throw new Error("Transaction is not balanced");
    }
    // تنفيذ المنطق
  }
}
