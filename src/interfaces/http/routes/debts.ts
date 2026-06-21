import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

function generateSchedule(principalCents: number, annualRateBps: number, termMonths: number) {
  const monthlyRate = annualRateBps / 100 / 100 / 12;
  const schedule = [];
  let remaining = BigInt(principalCents);
  const today = new Date();

  for (let i = 1; i <= termMonths; i++) {
    const interest = BigInt(Math.round(Number(remaining) * monthlyRate));
    const principal = BigInt(Math.round(principalCents / termMonths));
    const total = principal + interest;
    remaining -= principal;
    const due = new Date(today);
    due.setMonth(due.getMonth() + i);
    schedule.push({
      number: i,
      dueDate: due.toISOString().split("T")[0],
      principalCents: principal,
      interestCents: interest,
      totalCents: total,
      remainingCents: remaining > 0n ? remaining : 0n,
    });
  }
  return schedule;
}

export async function debtRoutes(app: FastifyInstance) {

  app.get("/debts", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    return sql`SELECT * FROM debt_agreements WHERE user_id = ${tenantId} ORDER BY created_at DESC`;
  });

  app.get("/debts/:id", async (req: any, reply: any) => {
    const { id } = req.params;
    const debts = await sql`SELECT * FROM debt_agreements WHERE id = ${id}`;
    if (!debts.length) return reply.status(404).send({ error: "الدين غير موجود" });
    const schedule = await sql`SELECT * FROM amortization_schedule WHERE debt_id = ${id} ORDER BY installment_number ASC`;
    return { debt: debts[0], schedule };
  });

  app.post("/debts", async (req: any) => {
    const { customerId, principalCents, annualRateBps, termMonths, amortType, currency } = req.body;
    const tenantId = req.user?.userId?.toString() ?? "1";
    const debt = await sql`
      INSERT INTO debt_agreements (user_id, customer_id, principal_cents, annual_rate_bps, term_months, amort_type, currency)
      VALUES (${tenantId}, ${customerId ?? null}, ${principalCents}, ${annualRateBps}, ${termMonths}, ${amortType ?? 'DECLINING'}, ${currency ?? 'EGP'})
      RETURNING *
    `;
    const debtId = debt[0].id;
    const schedule = generateSchedule(principalCents, annualRateBps, termMonths);
    for (const inst of schedule) {
      await sql`
        INSERT INTO amortization_schedule
          (debt_id, installment_number, due_date, principal_cents, interest_cents, total_payment_cents, remaining_balance_cents, status)
        VALUES (${debtId}, ${inst.number}, ${inst.dueDate}, ${inst.principalCents.toString()},
                ${inst.interestCents.toString()}, ${inst.totalCents.toString()},
                ${inst.remainingCents.toString()}, 'PENDING')
      `;
    }
    return { debt: debt[0], schedule: schedule.length };
  });
}
