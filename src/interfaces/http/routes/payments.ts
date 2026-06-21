import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function paymentRoutes(app: FastifyInstance) {

  app.post("/payments", async (req: any) => {
    const { debtId, paymentCents, currency, outstandingInterestCents, outstandingPenaltiesCents, outstandingPrincipalCents } = req.body;
    const tenantId = req.user?.userId?.toString() ?? "1";
    const penalties = BigInt(outstandingPenaltiesCents ?? 0);
    const interest  = BigInt(outstandingInterestCents ?? 0);
    const principal = BigInt(outstandingPrincipalCents ?? 0);
    const total     = BigInt(paymentCents);

    const result = await sql`
      INSERT INTO payments (debt_id, amount_cents, currency, penalties_paid, interest_paid, principal_paid, remaining)
      VALUES (${debtId}, ${total.toString()}, ${currency ?? 'EGP'},
              ${penalties.toString()}, ${interest.toString()}, ${principal.toString()}, '0')
      RETURNING id, paid_at
    `;
    const paymentId = result[0].id;

    // تحديث الأقساط
    const pending = await sql`
      SELECT id, total_payment_cents FROM amortization_schedule
      WHERE debt_id = ${debtId} AND status = 'PENDING'
      ORDER BY installment_number ASC
    `;
    let rem = principal + interest;
    for (const inst of pending) {
      if (rem <= 0n) break;
      const t = BigInt(inst.total_payment_cents);
      if (rem >= t) {
        await sql`UPDATE amortization_schedule SET status='PAID', paid_at=NOW() WHERE id=${inst.id}`;
        rem -= t;
      }
    }

    // قيد محاسبي
    const lines = [{ account: "CASH_ASSET", type: "DEBIT", amount: total.toString() }];
    if (principal > 0n) lines.push({ account: "LOAN_RECEIVABLE", type: "CREDIT", amount: principal.toString() });
    if (interest > 0n)  lines.push({ account: "INTEREST_INCOME", type: "CREDIT", amount: interest.toString() });
    if (penalties > 0n) lines.push({ account: "PENALTY_INCOME",  type: "CREDIT", amount: penalties.toString() });
    await sql`
      INSERT INTO journal_entries (tenant_id, reference, description, currency, lines)
      VALUES (${tenantId}, ${'PAY-'+paymentId}, 'Payment Received', ${currency ?? 'EGP'}, ${JSON.stringify(lines)}::jsonb)
    `.catch(() => {});

    return { paymentId, paidAt: result[0].paid_at, debtId, totalPaid: paymentCents };
  });

  app.get("/payments/:debtId", async (req: any) => {
    const { debtId } = req.params;
    return sql`SELECT * FROM payments WHERE debt_id = ${debtId} ORDER BY paid_at DESC`;
  });
}
