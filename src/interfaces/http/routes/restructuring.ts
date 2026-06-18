import { FastifyInstance } from "npm:fastify";
import { DebtRestructuringEngine } from "@core/financial-engine/restructuring.ts";
import { DebtRepository } from "../../../infrastructure/persistence/DebtRepository.ts";
import { AmortizationEngine, AmortizationType } from "@core/financial-engine/amortization.ts";
import { sql } from "../../../infrastructure/database/connection.ts";

export async function restructuringRoutes(app: FastifyInstance) {
  const restructuringEngine = new DebtRestructuringEngine();
  const debtRepo = new DebtRepository();
  const amortEngine = new AmortizationEngine();

  app.post("/restructure", async (req, reply) => {
    const {
      debtId,
      outstandingPrincipalCents,
      accruedInterestCents,
      accruedPenaltiesCents,
      newAnnualRateBps,
      newTermMonths,
      newType,
      newStartDate,
      interestWaiverBps,
      penaltyWaiverBps,
    } = req.body as any;

    if (!debtId || !outstandingPrincipalCents || !newAnnualRateBps || !newTermMonths || !newType)
      return reply.status(400).send({ error: "بيانات ناقصة" });

    const debt = await debtRepo.findById(debtId);
    if (!debt) return reply.status(404).send({ error: "الدين غير موجود" });

    const result = restructuringEngine.restructure({
      originalPrincipalCents:    debt.principalCents,
      currency:                  debt.currency,
      outstandingPrincipalCents: BigInt(outstandingPrincipalCents),
      accruedInterestCents:      BigInt(accruedInterestCents ?? 0),
      accruedPenaltiesCents:     BigInt(accruedPenaltiesCents ?? 0),
      newAnnualRateBps,
      newTermMonths,
      newStartDate: newStartDate ? new Date(newStartDate) : new Date(),
      newType:      newType as AmortizationType,
      interestWaiverBps: interestWaiverBps ?? 0,
      penaltyWaiverBps:  penaltyWaiverBps ?? 0,
    });

    const newDebtId = await debtRepo.save({
      userId:         debt.userId,
      principalCents: result.newPrincipalCents,
      currency:       debt.currency,
      annualRateBps:  newAnnualRateBps,
      termMonths:     newTermMonths,
      amortType:      newType,
      status:         "RESTRUCTURED",
    });

    await debtRepo.saveSchedule(newDebtId, result.schedule);

    await sql`UPDATE debt_agreements SET status = 'CLOSED' WHERE id = ${debtId}`;

    return {
      originalDebtId:      debtId,
      newDebtId,
      waivedInterestCents: result.waivedInterestCents.toString(),
      waivedPenalties:     result.waivedPenaltiesCents.toString(),
      newPrincipalCents:   result.newPrincipalCents.toString(),
      totalNewPayment:     result.totalNewPayment.toString(),
      totalNewInterest:    result.totalNewInterest.toString(),
      savingsVsOriginal:   result.savingsVsOriginal.toString(),
      schedule: result.schedule.map(r => ({
        installmentNumber:     r.installmentNumber,
        dueDate:               r.dueDate.toISOString().split("T")[0],
        principalCents:        r.principalCents.toString(),
        interestCents:         r.interestCents.toString(),
        totalPaymentCents:     r.totalPaymentCents.toString(),
        remainingBalanceCents: r.remainingBalanceCents.toString(),
      })),
    };
  });
}
