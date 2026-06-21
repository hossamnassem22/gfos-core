import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function analyticsRoutes(app: FastifyInstance) {

  app.get("/analytics/summary", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    const [ph] = await sql`
      SELECT
        COUNT(DISTINCT d.id) AS total_debts,
        COUNT(DISTINCT d.id) FILTER (WHERE d.status='ACTIVE') AS active_debts,
        COUNT(DISTINCT d.id) FILTER (WHERE d.status='CLOSED') AS closed_debts,
        COALESCE(SUM(d.principal_cents),0) AS total_principal_cents,
        COUNT(s.id) FILTER (WHERE s.status='OVERDUE') AS overdue_installments,
        COUNT(s.id) FILTER (WHERE s.status='PENDING') AS pending_installments,
        COUNT(s.id) FILTER (WHERE s.status='PAID') AS paid_installments,
        COALESCE(SUM(s.total_payment_cents) FILTER (WHERE s.status='OVERDUE'),0) AS overdue_amount_cents
      FROM debt_agreements d
      LEFT JOIN amortization_schedule s ON s.debt_id = d.id
      WHERE d.user_id = ${tenantId}
    `;
    const forecast = await sql`
      SELECT due_date, COUNT(*) AS installment_count, SUM(total_payment_cents) AS expected_cents
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE d.user_id = ${tenantId} AND s.status = 'PENDING' AND s.due_date >= CURRENT_DATE
      GROUP BY due_date ORDER BY due_date ASC LIMIT 30
    `;
    return { portfolioHealth: ph, cashflowForecast: forecast };
  });
}
