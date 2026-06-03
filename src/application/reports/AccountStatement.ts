import { eq } from 'drizzle-orm';
import { journalEntries } from '../../infrastructure/db/schema';
import { db } from '../../infrastructure/database/connection';

export class AccountStatement {
  async generateStatement(tenantId: string, _customerId: string) {
    // جلب كشف حساب لمستأجر محدد
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.tenantId, tenantId));
  }
}
