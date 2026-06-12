import { Money } from "@domain/ledger/Money.ts";

export enum EntryType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT"
}

export class JournalEntry {
  constructor(
    public readonly account: string,
    public readonly type: EntryType,
    public readonly amount: Money
  ) {}

  static create(account: string, type: EntryType, amount: Money): JournalEntry {
    return new JournalEntry(account, type, amount);
  }
}
