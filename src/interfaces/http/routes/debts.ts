import { FastifyInstance } from "npm:fastify";
import { requireAuth } from "../middleware/auth.ts";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";

const debtRepo = new DebtRepository();

export async function debtRoutes(app: FastifyInstance) {

  // GET list (بدون root)
  app.get("/list", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;

    const debts = await debtRepo.findByUser(userId);

    return {
      count: debts.length,
      debts: debts.map(d => ({
        ...d,
        principalCents: d.principalCents.toString()
      }))
    };
  });

  // GET single
  app.get("/:debtId", { preHandler: requireAuth }, async (req, reply) => {
    const { debtId } = req.params as any;

    const debt = await debtRepo.findById(debtId);

    if (!debt) {
      return reply.status(404).send({ error: "Debt not found" });
    }

    return debt;
  });
}
