import { FastifyInstance } from "npm:fastify";
import { PaymentWaterfall } from "@core/financial-engine/waterfall.ts";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";
import { Money } from "@core/precision/value-objects.ts";
import { sql } from "@infra/database/connection.ts";

const waterfall = new PaymentWaterfall();
const debtRepo = new DebtRepository();

export async function paymentRoutes(app: FastifyInstance) {

  app.post("/payments", async (req, reply) => {
    const {
      debtId,
      paymentCents,
      currency,
      outstandingPenaltiesCents,
      outstandingInterestCents,
      outstandingPrincipalCents,
    } = req.body as any;

    if (!debtId || !paymentCents || !currency)
      return reply.status(400).send({ error: "بيانات ناقصة" });

    const debt = await debtRepo.findById(debtId);
    if (!debt) return reply.status(404).send({ error: "الدين غير موجود" });

    const c = currency;
    const allocation = waterfall.allocate({
      payment:              Money.fromCents(BigInt(paymentCents), c),
      outstandingPenalties: Money.fromCents(BigInt(outstandingPenaltiesCents ?? 0), c),
      outstandingInterest:  Money.fromCents(BigInt(outstandingInterestCents ?? 0), c),
      outstandingPrincipal: Money.fromCents(BigInt(outstandingPrincipalCents ?? 0), c),
    });

    const result = await sql`
      INSERT INTO payments
        (debt_id, amount_cents, currency, penalties_paid, interest_paid, principal_paid, remaining)
      VALUES
        (${debtId}, ${paymentCents.toString()}, ${c},
         ${allocation.penalties.cents.toString()},
         ${allocation.interest.cents.toString()},
         ${allocation.principal.cents.toString()},
         ${allocation.remaining.cents.toString()})
      RETURNING id, paid_at
    `;

    return {
      paymentId: result[0].id,
      paidAt:    result[0].paid_at,
      debtId,
      totalPaid: paymentCents.toString(),
      allocation: {
        penalties: allocation.penalties.cents.toString(),
        interest:  allocation.interest.cents.toString(),
        principal: allocation.principal.cents.toString(),
        remaining: allocation.remaining.cents.toString(),
      },
      currency: c,
    };
  });

  app.get("/payments/:debtId", async (req, reply) => {
    const { debtId } = req.params as any;
    const rows = await sql`
      SELECT * FROM payments WHERE debt_id = ${debtId} ORDER BY paid_at DESC
    `;
    const totalPaid = rows.reduce((sum, r) => sum + BigInt(r.amount_cents), 0n);
    return {
      debtId,
      count: rows.length,
      totalPaidCents: totalPaid.toString(),
      payments: rows.map(r => ({
        id:            r.id,
        amountCents:   r.amount_cents.toString(),
        penaltiesPaid: r.penalties_paid.toString(),
        interestPaid:  r.interest_paid.toString(),
        principalPaid: r.principal_paid.toString(),
        remaining:     r.remaining.toString(),
        paidAt:        r.paid_at,
      })),
    };
  });
}
