import type { FastifyInstance } from "npm:fastify";
import authRoutes from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";
import { ledgerRoutes } from "./routes/ledger.ts";
import { metricsRoutes } from "./routes/metrics.ts";
import { customersRoutes } from "./routes/customers.ts";
import { debtRoutes } from "./routes/debts.ts";
import { paymentRoutes } from "./routes/payments.ts";
import { analyticsRoutes } from "./routes/analytics.ts";
import { notificationRoutes } from "./routes/notifications.ts";
import { statementRoutes } from "./routes/statement.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";

export async function registerRoutes(app: FastifyInstance) {
  await authRoutes(app);
  await healthRoutes(app);
  await ledgerRoutes(app);
  await metricsRoutes(app);
  await customersRoutes(app);
  await debtRoutes(app);
  await paymentRoutes(app);
  await analyticsRoutes(app);
  await notificationRoutes(app);
  await statementRoutes(app);
  await dashboardRoutes(app);
}
