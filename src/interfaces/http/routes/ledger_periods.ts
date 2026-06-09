import { FastifyInstance } from "npm:fastify";
import { requireAuth } from "../middleware/auth.ts";
import { FinancialPeriodService } from "@domain/ledger/FinancialPeriodService.ts";

const periodService = new FinancialPeriodService();

export async function periodRoutes(app: FastifyInstance) {
  app.post("/ledger/periods/close", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { periodId } = req.body as { periodId: string };
    
    try {
      await periodService.closePeriod(userId, periodId, userId);
      return { status: "success", message: "Period closed successfully" };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
}
