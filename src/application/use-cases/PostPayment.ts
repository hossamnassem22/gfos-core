import { JournalEntry, JournalLine } from '../../domain/ledger/JournalEntry.ts';
import { Money } from '../../domain/ledger/Money.ts';

export class PostPayment {
  static execute(
    entryId: string,
    tenantId: string,
    amount: number,
    fromAccount: string,
    toAccount: string
  ): JournalEntry {
    const entry = new JournalEntry(entryId, tenantId);
    
    // بناء القيد المحاسبي
    const payment = Money.from(amount);
    entry.addLine(new JournalLine(fromAccount, Money.from(0), payment)); // Credit
    entry.addLine(new JournalLine(toAccount, payment, Money.from(0)));   // Debit

    if (!entry.validateBalance()) {
      throw new Error("توازن القيد غير صحيح - تعذر الترحيل");
    }

    entry.status = 'POSTED';
    console.log(`✅ تم ترحيل العملية ${entryId} بنجاح للطرف ${tenantId}`);
    return entry;
  }
}
