import { Money } from "@core/precision/value-objects.ts";

export enum EntryType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT"
}

export class LedgerEntry {
  public readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly accountId: string,
    public readonly amount: Money,
    public readonly type: EntryType,
    timestamp?: Date
  ) {
    this.timestamp = timestamp || new Date();
  }

  static create(userId: string, accountId: string, amount: Money, type: EntryType): LedgerEntry {
    return new LedgerEntry(userId, accountId, amount, type, new Date());
  }
}
