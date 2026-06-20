import { LedgerPostingEngine } from '../ledger/LedgerPostingEngine.ts';

export class LedgerProjection {
  public static async project(events: FinancialEvent[]) {
    for (const event of events) {
      const entries = LedgerPostingEngine.post(event);
      // هنا نقوم بحفظ الـ JournalEntries في الـ Ledger Database
      await this.persistEntries(entries);
    }
  }

  private static async persistEntries(entries: any) {
    // منطق التخزين في جدول الـ General Ledger
  }
}
