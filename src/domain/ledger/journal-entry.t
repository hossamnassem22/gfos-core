// src/domain/ledger/journal-entry.ts
import { LedgerLine, EntryType } from './ledger-line';

export class JournalEntry {
  constructor(
    public readonly id: string,
    public readonly lines: LedgerLine[],
    public readonly timestamp: Date = new Date()
  ) {
    this.validateBalance();
  }

  private validateBalance(): void {
    const totalDebit = this.lines
      .filter(l => l.type === EntryType.DEBIT)
      .reduce((sum, l) => sum + l.amount, 0n);

    const totalCredit = this.lines
      .filter(l => l.type === EntryType.CREDIT)
      .reduce((sum, l) => sum + l.amount, 0n);

    if (totalDebit !== totalCredit) {
      throw new Error('Financial Invariant Violated: Debits must equal Credits');
    }
  }
}

