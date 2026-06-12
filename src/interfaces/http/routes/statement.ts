import { FastifyInstance } from "npm:fastify";
import { sql } from "@infra/database/connection.ts";

export async function statementRoutes(app: FastifyInstance) {

  app.get("/statement/:userId", async (req, reply) => {
    const { userId } = req.params as any;
    const { from, to } = req.query as any;

    const fromDate = from ? new Date(from) : new Date("2000-01-01");
    const toDate   = to   ? new Date(to)   : new Date();

    const debts = await sql`
      SELECT * FROM debt_agreements
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    if (debts.length === 0)
      return reply.status(404).send({ error: "لا توجد بيانات لهذا المستخدم" });

    const debtIds = debts.map(d => d.id);

    const payments = await sql`
      SELECT * FROM payments
      WHERE debt_id = ANY(${debtIds}::uuid[])
        AND paid_at >= ${fromDate}
        AND paid_at <= ${toDate}
      ORDER BY paid_at ASC
    `;

    const upcoming = await sql`
      SELECT s.*, d.user_id FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE d.user_id = ${userId}
        AND s.status = 'PENDING'
        AND s.due_date >= CURRENT_DATE
      ORDER BY s.due_date ASC
      LIMIT 5
    `;

    const totalPrincipal     = debts.reduce((s, d) => s + BigInt(d.principal_cents), 0n);
    const totalPaid          = payments.reduce((s, p) => s + BigInt(p.amount_cents), 0n);
    const totalPenalties     = payments.reduce((s, p) => s + BigInt(p.penalties_paid), 0n);
    const totalInterest      = payments.reduce((s, p) => s + BigInt(p.interest_paid), 0n);
    const totalPrincipalPaid = payments.reduce((s, p) => s + BigInt(p.principal_paid), 0n);

    return {
      userId,
      generatedAt: new Date().toISOString(),
      period: {
        from: fromDate.toISOString().split("T")[0],
        to:   toDate.toISOString().split("T")[0],
      },
      summary: {
        totalDebts:          debts.length,
        activeDebts:         debts.filter(d => d.status === "ACTIVE").length,
        totalPrincipalCents: totalPrincipal.toString(),
        totalPaidCents:      totalPaid.toString(),
        totalPenaltiesPaid:  totalPenalties.toString(),
        totalInterestPaid:   totalInterest.toString(),
        totalPrincipalPaid:  totalPrincipalPaid.toString(),
        remainingBalance:    (totalPrincipal - totalPrincipalPaid).toString(),
      },
      debts: debts.map(d => ({
        id:             d.id,
        principalCents: d.principal_cents.toString(),
        currency:       d.currency,
        annualRateBps:  d.annual_rate_bps,
        termMonths:     d.term_months,
        amortType:      d.amort_type,
        status:         d.status,
        createdAt:      d.created_at,
      })),
      payments: payments.map(p => ({
        id:            p.id,
        debtId:        p.debt_id,
        amountCents:   p.amount_cents.toString(),
        penaltiesPaid: p.penalties_paid.toString(),
        interestPaid:  p.interest_paid.toString(),
        principalPaid: p.principal_paid.toString(),
        paidAt:        p.paid_at,
      })),
      upcomingInstallments: upcoming.map(u => ({
        debtId:            u.debt_id,
        installmentNumber: u.installment_number,
        dueDate:           u.due_date,
        totalPaymentCents: u.total_payment_cents.toString(),
      })),
    };
  });
}
