import { Money } from '../../shared/Money';
import { JournalLine } from '../entities/JournalLine';

export class JournalEntry {
  private lines: JournalLine[] = [];
  public status: 'DRAFT' | 'POSTED' = 'DRAFT';

  constructor(public readonly id: string, public readonly tenantId: string) {}

  addLine(line: JournalLine) {
    if (this.status === 'POSTED') throw new Error("DOMAIN_ERROR: IMMUTABLE_POSTED_ENTRY");
    this.lines.push(line);
  }

  validate(): void {
    const totalDebit = this.lines.reduce((s, l) => s.add(l.debit), Money.from(0));
    const totalCredit = this.lines.reduce((s, l) => s.add(l.credit), Money.from(0));
    
    if (totalDebit.amount !== totalCredit.amount) {
      throw new Error("DOMAIN_ERROR: LEDGER_UNBALANCED");
    }
  }
}
