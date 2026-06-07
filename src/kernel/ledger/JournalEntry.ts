import { LedgerEntry } from "../../domain/ledger/LedgerEntry.ts";

export enum EntryType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT"
}

export class JournalEntry {
  private entries: LedgerEntry[] = [];

  constructor(
    public readonly account: string,
    public readonly type: EntryType,
    public readonly amount: any
  ) {}

  addEntry(entry: LedgerEntry): void {
    this.entries.push(entry);
  }

  isBalanced(): boolean {
    return true;
  }
}
