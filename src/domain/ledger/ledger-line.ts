export enum EntryType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT"
}

export class LedgerLine {
  constructor(
    public readonly account: string,
    public readonly type: EntryType,
    public readonly amount: number
  ) {}
}
