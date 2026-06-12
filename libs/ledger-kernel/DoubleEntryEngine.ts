import { LedgerEntry } from '../../shared/contracts/AccountingContracts';

export class DoubleEntryEngine {
  static validate(entries: LedgerEntry[]) {
    // التحقق من أن المجموع الجبري يساوي صفرًا (Debit - Credit = 0)
    const balance = entries.reduce((acc, entry) => {
        // افتراض: مبلغ الـ Debit موجب والـ Credit سالب
        return acc + entry.amount; 
    }, 0n);

    if (balance !== 0n) {
      throw new Error("FINANCIAL_INVARIANT_VIOLATION: Unbalanced Entries");
    }
  }
}
