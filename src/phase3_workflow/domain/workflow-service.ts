import { JournalEntry, JournalLine } from '../../phase1_core/domain/ledger-entry';
import { Money } from '../../phase1_core/domain/money';
import { Party } from '../../phase2_parties/domain/party-registry';

export class WorkflowService {
  static createDebtEntry(entry: JournalEntry, debtor: Party, amount: Money) {
    // التحقق البسيط: منع ترحيل دين إذا كان يتجاوز رصيد افتراضي (مثلاً 100,000)
    if (amount.raw > 100000n) {
      throw new Error("فشل الترحيل: المبلغ يتجاوز حد الائتمان المسموح.");
    }

    entry.addLine(new JournalLine(debtor.id, amount, Money.fromCents(0n)));
    entry.addLine(new JournalLine('REVENUE_ACC', Money.fromCents(0n), amount));
    
    entry.post();
    console.log(`✅ تم ترحيل قيد الدين بقيمة ${amount.raw} للطرف ${debtor.name}`);
  }
}
