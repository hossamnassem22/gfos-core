import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function metricsRoutes(app: FastifyInstance) {

  app.get("/metrics", async () => {
    const [overdue, pending, paid, active, unread, journals] = await Promise.all([
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status='OVERDUE'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status='PENDING'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status='PAID'`,
      sql`SELECT COUNT(*) AS c FROM debt_agreements WHERE status='ACTIVE'`,
      sql`SELECT COUNT(*) AS c FROM notifications WHERE is_read=false`,
      sql`SELECT COUNT(*) AS c FROM journal_entries`,
    ]);
    return {
      timestamp: new Date().toISOString(),
      installments: { overdue: Number(overdue[0].c), pending: Number(pending[0].c), paid: Number(paid[0].c) },
      debts: { active: Number(active[0].c) },
      notifications: { unread: Number(unread[0].c) },
      ledger: { journalEntries: Number(journals[0].c) },
    };
  });
}
