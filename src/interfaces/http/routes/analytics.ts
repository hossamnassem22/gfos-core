import { FastifyInstance } from "npm:fastify";
import { sql } from "@infra/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";

export async function analyticsRoutes(app: FastifyInstance) {

  app.get("/analytics/portfolio-health", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const rows = await sql`SELECT * FROM analytics_portfolio_health WHERE tenant_id = ${userId}`;
    return rows[0] ?? {};
  });

  app.get("/analytics/cashflow-forecast", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    return await sql`SELECT * FROM analytics_cashflow_forecast WHERE tenant_id = ${userId}`;
  });

  app.get("/analytics/monthly-collections", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    return await sql`SELECT * FROM analytics_monthly_collections WHERE tenant_id = ${userId} LIMIT 12`;
  });

  app.get("/analytics/summary", { preHandler: requireAuth }, async (req) => {
    const { userId } = (req as any).user;
    const [health, forecast, collections] = await Promise.all([
      sql`SELECT * FROM analytics_portfolio_health WHERE tenant_id = ${userId}`,
      sql`SELECT * FROM analytics_cashflow_forecast WHERE tenant_id = ${userId}`,
      sql`SELECT * FROM analytics_monthly_collections WHERE tenant_id = ${userId} LIMIT 12`,
    ]);
    return {
      portfolioHealth:    health[0] ?? {},
      cashflowForecast:   forecast,
      monthlyCollections: collections,
    };
  });
}
