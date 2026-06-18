import { sql } from "../../../infrastructure/database/connection.ts";

export interface OverdueOptions {
  dryRun?: boolean;
  maxDaysLate?: number | null;
  batchSize?: number;
  tenantId?: string;
}

export class OverdueEngine {
  static async process(options: OverdueOptions = {}) {
    const { dryRun = true, maxDaysLate = null, batchSize = 100, tenantId } = options;

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

    await sql.begin(async (tx) => {
      const processedIds = candidates.map(c => c.id);
      await tx`UPDATE amortization_schedule SET status = 'OVERDUE' WHERE id IN ${tx(processedIds)}`;

      for (const item of candidates) {
        const payload = {
          installmentId: item.id,
          customerId: item.user_id,
          amountCents: String(item.total_payment_cents),
          currency: item.currency,
          dueDate: item.due_date,
          occurredAt: new Date().toISOString(),
          daysLate: Math.floor((Date.now() - new Date(item.due_date).getTime()) / 86400000)
        };

        await tx`
          INSERT INTO financial_events (event_type, payload)
          VALUES ('InstallmentOverdue', ${tx.json(payload)})
        `;
      }
    });

    return { mode: 'PRODUCTION', processed: candidates.length };
  }
}
