import { LedgerEntry } from "@domain/ledger/LedgerEntry.ts";
import { EntryType } from "@domain/ledger/ledger-line.ts";
import { Money } from "@domain/ledger/Money.ts";

// Mocking repository for test
const repo = {
  save: async (entry: LedgerEntry) => console.log("Saved")
};

async function testWallet() {
  const userId = "user-1";
  const amount = new Money(100n, "EGP");
  await repo.save(LedgerEntry.create(userId, "ACC-001", amount, EntryType.DEBIT));
}
