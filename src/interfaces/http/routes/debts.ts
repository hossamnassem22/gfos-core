import { FastifyInstance } from "npm:fastify";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";
import { AmortizationEngine, AmortizationType } from "@core/financial-engine/amortization.ts";

export async function debtRoutes(app: FastifyInstance) {
  const debtRepo = new DebtRepository();
  const amortEngine = new AmortizationEngine();

  app.post("/debts", async (req, reply) => {
    const {
      userId, customerId, principalCents, currency,
      annualRateBps, termMonths, amortType, startDate
    } = req.body as any;

    if (!userId || !principalCents || !currency || !annualRateBps || !termMonths || !amortType)
      return reply.status(400).send({ error: "بيانات ناقصة" });

    const debtId = await debtRepo.save({
      userId,
      principalCents: BigInt(principalCents),
      currency,
      annualRateBps,
      termMonths,
      amortType,
      customerId,
      status: "ACTIVE",
    });

    const schedule = amortEngine.generate({
      principalCents: BigInt(principalCents),
      currency,
      annualRateBps,
      termMonths,
      startDate: startDate ? new Date(startDate) : new Date(),
      type: (amortType === "DECLINING_BALANCE" ? "DECLINING" : amortType === "FLAT_RATE" ? "FLAT" : amortType) as AmortizationType,
    });

    await debtRepo.saveSchedule(debtId, schedule);
    const totals = amortEngine.totalCost(schedule);

    return {
      debtId,
      userId,
      principalCents: principalCents.toString(),
      currency,
      schedule: schedule.map(r => ({
        installmentNumber:     r.installmentNumber,
        dueDate:               r.dueDate.toISOString().split("T")[0],
        principalCents:        r.principalCents.toString(),
        interestCents:         r.interestCents.toString(),
        totalPaymentCents:     r.totalPaymentCents.toString(),
        remainingBalanceCents: r.remainingBalanceCents.toString(),
      })),
      totals: {
        totalPrincipal: totals.totalPrincipal.toString(),
        totalInterest:  totals.totalInterest.toString(),
        totalPayment:   totals.totalPayment.toString(),
      },
    };
  });

  app.get("/debts/:debtId", async (req, reply) => {
    const { debtId } = req.params as any;
    const debt = await debtRepo.findById(debtId);
    if (!debt) return reply.status(404).send({ error: "الدين غير موجود" });
    const schedule = await debtRepo.getSchedule(debtId);
    return {
      debt: { ...debt, principalCents: debt.principalCents.toString() },
      schedule: schedule.map(r => ({
        installmentNumber:     r.installmentNumber,
        dueDate:               r.dueDate.toISOString().split("T")[0],
        principalCents:        r.principalCents.toString(),
        interestCents:         r.interestCents.toString(),
        totalPaymentCents:     r.totalPaymentCents.toString(),
        remainingBalanceCents: r.remainingBalanceCents.toString(),
      })),
    };
  });

  app.get("/debts/user/:userId", async (req, reply) => {
    const { userId } = req.params as any;
    const debts = await debtRepo.findByUser(userId);
    return {
      userId,
      count: debts.length,
      debts: debts.map(d => ({ ...d, principalCents: d.principalCents.toString() })),
    };
  });
}
