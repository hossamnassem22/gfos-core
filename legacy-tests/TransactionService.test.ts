import { assertThrows } from "@std/assert";
import { JournalEntry } from "./JournalEntry.ts";
import { LedgerEntry, EntryType } from "./LedgerEntry.ts";
import { Money } from "./Money.ts";
import { TransactionService } from "./TransactionService.ts";

Deno.test("TransactionService: Should throw error if journal is unbalanced", () => {
  const journal = new JournalEntry();
  journal.addEntry(LedgerEntry.create("user_123", "ACC-001", Money.fromCents(100n), EntryType.DEBIT));
  
  assertThrows(() => {
    TransactionService.commit(journal);
  }, Error, "Transaction rejected");
});
