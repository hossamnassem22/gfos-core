import { FastifyInstance } from "fastify";
import { sql } from "../../../infrastructure/database/connection.ts";

export async function customerSummaryRoutes(app: FastifyInstance) {
  app.get("/customers/portfolio", async (_req, reply) => {
    const rows = await sql`
      SELECT *
      FROM customer_portfolio_summary
      ORDER BY overdue_amount_cents DESC, name ASC
    `;

    return reply.send(rows);
  });
}
