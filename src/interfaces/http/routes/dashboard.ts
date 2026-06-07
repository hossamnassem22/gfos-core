
import { FastifyInstance } from "npm:fastify";
import { sql } from "@infra/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";
import { OverdueEngine } from "@app/services/OverdueEngine.ts";

export async function dashboardRoutes(app: FastifyInstance) {

  app.get("/dashboard/installments", { preHandler: requireAuth }, async (req) => {
    return await sql`SELECT * FROM dashboard_installments ORDER BY due_date ASC`;
  });

  app.get("/dashboard/overdue", { preHandler: requireAuth }, async (req) => {
    return await sql`SELECT * FROM view_overdue_report ORDER BY days_late DESC`;
  });

  app.get("/dashboard/overdue-summary", { preHandler: requireAuth }, async (req) => {
    const rows = await sql`SELECT * FROM dashboard_overdue_summary`;
    return rows[0];
  });

  app.post("/dashboard/run-overdue", { preHandler: requireAuth }, async (req) => {
    const { dryRun = false } = req.body as any;
    const result = await OverdueEngine.process({ dryRun });
    return result;
  });
}

 



