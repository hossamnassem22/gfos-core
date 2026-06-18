import { FastifyInstance } from "npm:fastify";
import { PaymentWaterfall } from "@core/financial-engine/waterfall.ts";
import { DebtRepository } from "../../../infrastructure/persistence/DebtRepository.ts";
import { JournalRepository } from "../../../infrastructure/persistence/JournalRepository.ts";
import { JournalEngine } from "@core/ledger/JournalEngine.ts";
import { Money } from "@core/precision/value-objects.ts";
import { sql } from "../../../infrastructure/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";

const waterfall = new PaymentWaterfall();
const debtRepo  = new DebtRepository();
const journalRepo = new JournalRepository();

export async function paymentRoutes(app: FastifyInstance) {

  app.post("/payments", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
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

    // 1. تسجيل الدفعة
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
    const paymentId = result[0].id;

    // 2. تحديث الأقساط — PENDING → PAID (الأقدم أولاً)
    const pendingInstallments = await sql`
      SELECT id, total_payment_cents, principal_cents, interest_cents
      FROM amortization_schedule
      WHERE debt_id = ${debtId} AND status = 'PENDING'
      ORDER BY installment_number ASC
    `;

    let remainingPayment = allocation.principal.cents + allocation.interest.cents;
    for (const inst of pendingInstallments) {
      if (remainingPayment <= 0n) break;
      const instTotal = BigInt(inst.total_payment_cents);
      if (remainingPayment >= instTotal) {
        await sql`
          UPDATE amortization_schedule
          SET status = 'PAID', paid_at = NOW()
          WHERE id = ${inst.id}
        `;
        remainingPayment -= instTotal;
      }
    }

    // 3. تسجيل قيد محاسبي
    try {
      const entry = JournalEngine.createPaymentEntry({
        tenantId:       userId,
        reference:      `PAY-${paymentId}`,
        currency:       c,
        amountCents:    BigInt(paymentCents),
        principalCents: allocation.principal.cents,
        interestCents:  allocation.interest.cents,
        penaltiesCents: allocation.penalties.cents,
      });
      await journalRepo.save(entry);
    } catch (_e: any) {
      console.error("[Journal Error]", _e?.message ?? _e);
      // الـ journal فشل لكن الدفعة اتسجلت — نسجّل warning
      console.warn(`[Payment] Journal entry failed for payment ${paymentId}`);
    }

    return {
      paymentId,
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
      count:          rows.length,
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

  // ملخص الدفعات لدين معين
  app.get("/payments/:debtId/summary", async (req, reply) => {
    const { debtId } = req.params as any;
    const [paid, overdue, pending] = await Promise.all([
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE debt_id = ${debtId} AND status = 'PAID'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE debt_id = ${debtId} AND status = 'OVERDUE'`,
      sql`SELECT COUNT(*) AS c FROM amortization_schedule WHERE debt_id = ${debtId} AND status = 'PENDING'`,
    ]);
    const totalPayments = await sql`SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE debt_id = ${debtId}`;
    return {
      debtId,
      installments: {
        paid:    Number(paid[0].c),
        overdue: Number(overdue[0].c),
        pending: Number(pending[0].c),
      },
      totalPaidCents: totalPayments[0].total.toString(),
    };
  });
}
