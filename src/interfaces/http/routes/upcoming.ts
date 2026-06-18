import { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructu../../infrastructure/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";

export async function upcomingRoutes(app: FastifyInstance) {
  app.get("/debts/upcoming", { preHandler: requireAuth }, async (req, reply) => {
    const rows = await sql`
      SELECT s.*, d.user_id 
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE s.status = 'PENDING'
      AND s.due_date <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY s.due_date ASC
    `;
    return rows;
  });
}
