import type { FastifyInstance } from "npm:fastify";
import authRoutes from "./routes/auth.ts";
import { ledgerRoutes } from "./routes/ledger.ts";
import { healthRoutes } from "./routes/health.ts";

export async function registerRoutes(app: FastifyInstance) {
  await authRoutes(app);
  await ledgerRoutes(app);
  await healthRoutes(app);
}
