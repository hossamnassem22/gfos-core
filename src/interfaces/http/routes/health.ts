import { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructu../../infrastructure/database/connection.ts";

export async function healthRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    status: "ok",
    service: "selfni-core",
    version: "0.9.0",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/deep", async (req, reply) => {
    const checks: Record<string, any> = {};
    let healthy = true;

    try {
      const start = Date.now();
      await sql`SELECT 1`;
      checks.database = { status: "ok", latencyMs: Date.now() - start };
    } catch (e: any) {
      checks.database = { status: "error", message: e.message };
      healthy = false;
    }

    try {
      const tables = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
      `;
      checks.tables = { status: "ok", count: tables.length, names: tables.map(t => t.table_name) };
    } catch (e: any) {
      checks.tables = { status: "error", message: e.message };
      healthy = false;
    }

    try {
      const [users, customers, debts, payments, events, notifications] = await Promise.all([
        sql`SELECT COUNT(*) AS c FROM users`,
        sql`SELECT COUNT(*) AS c FROM customers`,
        sql`SELECT COUNT(*) AS c FROM debt_agreements`,
        sql`SELECT COUNT(*) AS c FROM payments`,
        sql`SELECT COUNT(*) AS c FROM financial_events`,
        sql`SELECT COUNT(*) AS c FROM notifications`,
      ]);
      checks.data = {
        status: "ok",
        users:           Number(users[0].c),
        customers:       Number(customers[0].c),
        debts:           Number(debts[0].c),
        payments:        Number(payments[0].c),
        financialEvents: Number(events[0].c),
        notifications:   Number(notifications[0].c),
      };
    } catch (e: any) {
      checks.data = { status: "error", message: e.message };
    }

    return reply.status(healthy ? 200 : 503).send({
      status:    healthy ? "ok" : "degraded",
      service:   "selfni-core",
      version:   "0.9.0",
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  app.get("/metrics", async () => {
    const [
      overdueRows,
      pendingRows,
      paidRows,
      activeDebtsRows,
      notifRows,
      journalRows,
      overdueAmountRows,
    ] = await Promise.all([
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status = 'OVERDUE'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status = 'PENDING'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE status = 'PAID'`,
      sql`SELECT COUNT(*) AS c FROM debt_agreements WHERE status = 'ACTIVE'`,
      sql`SELECT COUNT(*) AS c FROM notifications WHERE is_read = false`,
      sql`SELECT COUNT(*) AS c FROM journal_entries`,
      sql`SELECT COALESCE(SUM(total_payment_cents), 0) AS total FROM amortization_schedule WHERE status = 'OVERDUE'`,
    ]);

    return {
      timestamp: new Date().toISOString(),
      installments: {
        overdue: Number(overdueRows[0].c),
        pending: Number(pendingRows[0].c),
        paid:    Number(paidRows[0].c),
      },
      debts: {
        active: Number(activeDebtsRows[0].c),
      },
      overdue: {
        totalAmountCents: overdueAmountRows[0].total.toString(),
      },
      notifications: {
        unread: Number(notifRows[0].c),
      },
      ledger: {
        journalEntries: Number(journalRows[0].c),
      },
    };
  });
}
