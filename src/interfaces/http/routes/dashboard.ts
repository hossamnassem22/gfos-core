import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function dashboardRoutes(app: FastifyInstance) {

  app.get("/dashboard/overdue", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    return sql`
      SELECT s.*, CURRENT_DATE - s.due_date AS days_late
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE d.user_id = ${tenantId} AND s.status = 'OVERDUE'
      ORDER BY s.due_date ASC LIMIT 100
    `;
  });

  app.get("/dashboard/overdue-summary", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    const [r] = await sql`
      SELECT COUNT(*) AS overdue_count,
             COALESCE(SUM(s.total_payment_cents),0) AS overdue_amount_cents,
             COALESCE(AVG(CURRENT_DATE - s.due_date),0) AS average_days_late,
             COALESCE(MAX(CURRENT_DATE - s.due_date),0) AS max_days_late
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE d.user_id = ${tenantId} AND s.status = 'OVERDUE'
    `;
    return r;
  });
}
