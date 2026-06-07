import { JournalEntry } from "./src/domain/ledger/JournalEntry.ts";
import { LedgerEntry, EntryType } from "./src/domain/ledger/LedgerEntry.ts";
import { Money } from "./src/domain/ledger/Money.ts";
import { TransactionService } from "./src/domain/ledger/TransactionService.ts";

const journal = new JournalEntry();
journal.addEntry(LedgerEntry.create("ACC-001", Money.fromCents(100n), EntryType.DEBIT));

try {
  TransactionService.commit(journal);
} catch (e) {
  console.log("تم اكتشاف الخطأ بنجاح:", e.message);
}
