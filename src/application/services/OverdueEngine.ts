import { sql } from "@infra/database/connection.ts";

export interface OverdueOptions {
  dryRun?: boolean;
  maxDaysLate?: number | null;
  batchSize?: number;
  tenantId?: string;
}

export class OverdueEngine {
  static async process(options: OverdueOptions = {}) {
    const { dryRun = true, maxDaysLate = null, batchSize = 100, tenantId } = options;

    // 1. تحديد المرشحين
    let query = sql`
      SELECT s.id, s.debt_id, s.due_date, s.total_payment_cents, d.user_id, d.currency
      FROM amortization_schedule s
      JOIN debt_agreements d ON s.debt_id = d.id
      WHERE s.status = 'PENDING' AND s.due_date < CURRENT_DATE
    `;

    if (tenantId) query = sql`${query} AND d.user_id = ${tenantId}`;
    if (maxDaysLate !== null) query = sql`${query} AND s.due_date >= CURRENT_DATE - (${maxDaysLate} * INTERVAL '1 day')`;
    
    query = sql`${query} LIMIT ${batchSize}`;

    const candidates = await query;
    if (candidates.length === 0) return { mode: dryRun ? 'DRY_RUN' : 'PRODUCTION', candidates: 0 };

    if (dryRun) return { mode: 'DRY_RUN', candidates: candidates.length };

    // 2. التنفيذ الآمن داخل Transaction
    await sql.begin(async (sql) => {
      const processedIds = candidates.map(c => c.id);
      
      // تحديث الحالة
      await sql`UPDATE amortization_schedule SET status = 'OVERDUE' WHERE id IN ${sql(processedIds)}`;
      
      // تسجيل الأحداث مع مراعاة Idempotency
      for (const item of candidates) {
        await sql`
          INSERT INTO financial_events (event_type, payload)
          VALUES ('InstallmentOverdue', ${{
  installmentId: item.id,
  customerId: item.user_id,
  amountCents: String(item.total_payment_cents),
  currency: item.currency,
  dueDate: item.due_date,
  occurredAt: new Date().toISOString(),
  daysLate: Math.floor((Date.now() - new Date(item.due_date).getTime()) / 86400000)
}})
          ON CONFLICT DO NOTHING
        `;
      }
    });

    return { mode: 'PRODUCTION', processed: candidates.length };
  }
}
