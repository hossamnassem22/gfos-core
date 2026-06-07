import { assertEquals } from "@std/assert";
import { LedgerEntry, EntryType } from "./LedgerEntry.ts";
import { Money } from "./Money.ts";

Deno.test("LedgerEntry: Should create a valid DEBIT entry", () => {
  const amount = Money.fromCents(100n);
  const entry = LedgerEntry.create("user_123", "ACC-001", amount, EntryType.DEBIT);
  assertEquals(entry.amount.cents, 100n);
  assertEquals(entry.type, EntryType.DEBIT);
});
