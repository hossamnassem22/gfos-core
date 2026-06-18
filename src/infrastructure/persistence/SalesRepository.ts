import { sql } from "../../database/connection.ts";

export class SalesRepository {
  // تسجيل عملية بيع
  async recordSale(sale: { salesmanId: string; amount: number; commissionRate: number }) {
    const commission = sale.amount * sale.commissionRate;
    await sql`
      INSERT INTO ledger_entries (user_id, account_id, amount_cents, entry_type, description)
      VALUES (${sale.salesmanId}, 'SALES', ${sale.amount * 100}, 'CREDIT', 'Sale Record');
      
      INSERT INTO ledger_entries (user_id, account_id, amount_cents, entry_type, description)
      VALUES (${sale.salesmanId}, 'COMMISSION', ${commission * 100}, 'DEBIT', 'Auto-Commission');
    `;
  }

  // تقرير عمولات مندوب
  async getSalesmanBalance(salesmanId: string) {
    return await sql`
      SELECT account_id, SUM(amount_cents) / 100 as total
      FROM ledger_entries
      WHERE user_id = ${salesmanId}
      GROUP BY account_id
    `;
  }
}
