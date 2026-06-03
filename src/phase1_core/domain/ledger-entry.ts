import { Money } from './money';
import { AuditLogger } from '../../phase4_audit/domain/audit-logger';

export class JournalLine { constructor(public acc: string, public debit: Money, public credit: Money) {} }

export class JournalEntry {
  private lines: JournalLine[] = [];
  status: 'draft' | 'posted' = 'draft';
  constructor(public readonly id: string) {}

  addLine(l: JournalLine) { this.lines.push(l); }

  post() {
    const d = this.lines.reduce((s, l) => s.add(l.debit), Money.fromCents(0n));
    const c = this.lines.reduce((s, l) => s.add(l.credit), Money.fromCents(0n));
    if (d.raw !== c.raw) throw new Error("UNBALANCED");
    
    this.status = 'posted';
    
    // تسجيل العملية في سجل التدقيق
    AuditLogger.log('POST_ENTRY', { entryId: this.id, total: d.raw.toString() });
  }
}
