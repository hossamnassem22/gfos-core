import { assertEquals } from "@std/assert";
import { Money } from "@domain/ledger/Money.ts";
import { LedgerEntry } from "@domain/ledger/LedgerEntry.ts";
import { EntryType } from "@domain/ledger/types.ts";

Deno.test("Journal Entry: Correct amount instantiation", () => {
  const amount = Money.fromCents(1000n);
  assertEquals(amount.cents, 1000n);
});
