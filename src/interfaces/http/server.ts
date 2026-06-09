import Fastify from "npm:fastify";
import cors from "npm:@fastify/cors";
import { validateInput } from "./middleware/validateInput.ts";
import { securityHeaders } from "./middleware/securityHeaders.ts";
import { rateLimiter } from "./middleware/rateLimiter.ts";
import { requestLogger } from "./middleware/requestLogger.ts";
import { healthRoutes } from "./routes/health.ts";
import { ledgerRoutes } from "./routes/ledger.ts";
import { analyticsRoutes } from "./routes/analytics.ts";
import { notificationRoutes } from "./routes/notifications.ts";
import { customerRoutes } from "./routes/customers.ts";
import { authRoutes } from "./routes/auth.ts";
import { debtRoutes } from "./routes/debts.ts";
import { paymentRoutes } from "./routes/payments.ts";
import { restructuringRoutes } from "./routes/restructuring.ts";
import { statementRoutes } from "./routes/statement.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";
import { startOverdueScheduler } from "@infra/scheduler/OverdueScheduler.ts";

const app = Fastify({ logger: false });
await app.register(cors);

await app.register(validateInput);
await app.register(securityHeaders);
await app.register(rateLimiter);
await app.register(requestLogger);

await app.register(healthRoutes);
await app.register(ledgerRoutes);
await app.register(analyticsRoutes);
await app.register(notificationRoutes);
await app.register(customerRoutes);
await app.register(authRoutes);
await app.register(debtRoutes);
await app.register(paymentRoutes);
await app.register(restructuringRoutes);
await app.register(statementRoutes);
await app.register(dashboardRoutes);

startOverdueScheduler();

await app.listen({ port: 3011, host: "0.0.0.0" });
console.log("Selfni Core API running on port 3011");
