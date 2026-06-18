import { sql } from "../../infrastructure/database/connection.ts";

export class SalesmanReportService {
  async getSalesmanPerformance(merchantId: string) {
    return await sql`
      SELECT 
        s.name as salesman_name,
        COUNT(o.id) as total_sales_count,
        SUM(o.total_amount) as total_sales_value,
        SUM(l.amount) as total_commission_earned
      FROM salesmen s
      LEFT JOIN orders o ON s.id = o.salesman_id
      LEFT JOIN ledger_entries l ON o.id = l.order_id AND l.type = 'COMMISSION'
      WHERE s.merchant_id = ${merchantId}
      GROUP BY s.id, s.name
    `;
  }
}
