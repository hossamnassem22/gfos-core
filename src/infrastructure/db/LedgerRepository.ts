import { eq } from 'drizzle-orm';
import { journalEntries } from './schema';
import { db } from '../database/connection';

export class LedgerRepository {
  /**
   * جلب قيود دفتر اليومية لمستأجر محدد.
   * تم إزالة أي استخدام للـ 'any' لضمان اتساق البيانات.
   */
  async getEntriesByTenant(tenantId: string) {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, tenantId));
  }
}
