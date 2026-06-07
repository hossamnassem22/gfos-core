import { sql } from "@infra/database/connection.ts";

export class ReportService {
  async getMerchantDailyReport(merchantId: string) {
    const report = await sql`
      SELECT 
        COUNT(order_id) as total_orders,
        SUM(amount) as total_sales
      FROM ledger_entries
      WHERE merchant_id = ${merchantId}
        AND type = 'SALE'
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    return report[0];
  }
}
