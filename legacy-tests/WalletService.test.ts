import { assertEquals } from "@std/assert";
import { Money } from "@domain/ledger/Money.ts";
import { LedgerEntry } from "@domain/ledger/LedgerEntry.ts";
import { EntryType } from "@domain/ledger/types.ts";

// فرضية: نفترض أن repo تم تعريفه هنا أو تم عمل Mocks له
Deno.test("Wallet Service: Debit and Credit operations", async () => {
  const userId = "user_123";
  const amount = Money.fromCents(1000n);
  
  // تصحيح الاستدعاءات لتطابق Money API الجديد
  await repo.save(LedgerEntry.create(userId, "ACC-001", amount, EntryType.DEBIT));
});
