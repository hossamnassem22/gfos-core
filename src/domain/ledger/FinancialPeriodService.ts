import { sql } from "@infra/database/connection.ts";

export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export class FinancialPeriodService {
  async canPostToDate(tenantId: string, date: Date): Promise<boolean> {
    const rows = await sql`
      SELECT status FROM financial_periods 
      WHERE tenant_id = ${tenantId} 
      AND ${date.toISOString()}::date BETWEEN start_date AND end_date
    `;
    if (rows.length === 0) return true;
    return rows[0].status === 'OPEN';
  }

  async closePeriod(tenantId: string, periodId: string, closedBy: string): Promise<void> {
    // 1. تحقق من التوازن
    const [balance] = await sql`
      SELECT SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE -amount END) as net
      FROM journal_entries, jsonb_to_recordset(lines) as x(account text, type text, amount bigint)
      WHERE tenant_id = ${tenantId}
    `;
    
    if (balance.net !== 0n) {
      throw new Error("Cannot close period: Trial Balance is not balanced.");
    }

    // 2. تحديث الحالة وتسجيل الأثر (Transaction)
    await sql.begin(async (sql) => {
      await sql`UPDATE financial_periods SET status = 'CLOSED' WHERE id = ${periodId}`;
      
      await sql`INSERT INTO audit_logs (entity_type, entity_id, action, metadata) 
                VALUES ('PERIOD', ${periodId}, 'CLOSED', ${JSON.stringify({ closedBy, closedAt: new Date() })}::jsonb)`;
    });
  }
}
