import { Money } from './Money';
import { ErrorCodes } from '../constants/ErrorCodes';

export class JournalLine {
  constructor(
    public readonly accountId: string,
    public readonly debit: Money,
    public readonly credit: Money
  ) {}
}

export class JournalEntry {
  private lines: JournalLine[] = [];
  public status: 'DRAFT' | 'POSTED' = 'DRAFT';

  constructor(public readonly id: string, public readonly tenantId: string) {}

  addLine(line: JournalLine) {
    if (this.status === 'POSTED') throw new Error("DR-002: IMMUTABLE_ENTRY");
    this.lines.push(line);
  }

  validateBalance(): void {
    const totalDebit = this.lines.reduce((s, l) => s.add(l.debit), Money.from(0));
    const totalCredit = this.lines.reduce((s, l) => s.add(l.credit), Money.from(0));
    
    if (totalDebit.amount !== totalCredit.amount) {
      throw new Error(ErrorCodes.LEDGER_UNBALANCED);
    }
  }
}
