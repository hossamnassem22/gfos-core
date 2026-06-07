import Fastify from "npm:fastify";
import cors from "npm:@fastify/cors";
import { authRoutes } from "./routes/auth.ts";
import { debtRoutes } from "./routes/debts.ts";
import { paymentRoutes } from "./routes/payments.ts";
import { restructuringRoutes } from "./routes/restructuring.ts";
import { statementRoutes } from "./routes/statement.ts";
import { customerRoutes } from "./routes/customers.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";
import { startOverdueScheduler } from "@infra/scheduler/OverdueScheduler.ts";

const app = Fastify({ logger: false });
await app.register(cors);

await app.register(authRoutes);
await app.register(debtRoutes);
await app.register(paymentRoutes);
await app.register(restructuringRoutes);
await app.register(statementRoutes);
await app.register(customerRoutes);
await app.register(dashboardRoutes);

app.get("/health", () => ({ status: "ok", service: "selfni-core" }));

startOverdueScheduler();

await app.listen({ port: 3011, host: "0.0.0.0" });
console.log("Selfni Core API running on port 3011");
