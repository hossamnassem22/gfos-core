import { FastifyInstance } from "npm:fastify";
import { sql } from "@infra/database/connection.ts";

export async function healthRoutes(app: FastifyInstance) {
  // فحص الحالة الأساسي
  app.get("/health", async () => ({
    status: "ok",
    service: "selfni-core",
    version: "0.9.0",
    timestamp: new Date().toISOString(),
  }));

  // فحص الحالة العميق
  app.get("/health/deep", async (req, reply) => {
    const checks: Record<string, any> = {};
    let healthy = true;

    try {
      await sql`SELECT 1`;
      checks.database = { status: "ok" };
    } catch (e: any) {
      checks.database = { status: "error", message: e.message };
      healthy = false;
    }

    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  // مقاييس النظام
  app.get("/metrics", async () => {
    const [journalCount] = await sql`SELECT COUNT(*) AS c FROM journal_entries`;
    return {
      timestamp: new Date().toISOString(),
      ledger: { journalEntries: Number(journalCount[0].c) },
    };
  });
}
