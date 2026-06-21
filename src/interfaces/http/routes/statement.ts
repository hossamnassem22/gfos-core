import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/db/connection.ts";

export async function statementRoutes(app: FastifyInstance) {

  app.get("/statement/customer/:customerId", async (req: any, reply: any) => {
    const { customerId } = req.params;
    const customers = await sql`SELECT * FROM customers WHERE id = ${customerId}`;
    if (!customers.length) return reply.status(404).send({ error: "العميل غير موجود" });
    const c = customers[0];
    const debts = await sql`SELECT * FROM debt_agreements WHERE customer_id = ${customerId} ORDER BY created_at ASC`;
    const debtIds = debts.map((d: any) => d.id);
    const installments = debtIds.length ? await sql`SELECT * FROM amortization_schedule WHERE debt_id = ANY(${debtIds}::uuid[]) ORDER BY due_date ASC` : [];
    const payments = debtIds.length ? await sql`SELECT * FROM payments WHERE debt_id = ANY(${debtIds}::uuid[]) ORDER BY paid_at ASC` : [];
    const totalPrincipal = debts.reduce((s: bigint, d: any) => s + BigInt(d.principal_cents), 0n);
    const totalPaid = payments.reduce((s: bigint, p: any) => s + BigInt(p.principal_paid), 0n);
    const movements: any[] = [];
    let balance = 0n;
    for (const d of debts) { balance += BigInt(d.principal_cents); movements.push({ date: d.created_at, type: "DEBT", description: `دين — ${d.amort_type}`, debitCents: d.principal_cents.toString(), creditCents: "0", balanceCents: balance.toString() }); }
    for (const p of payments) { balance -= BigInt(p.principal_paid); movements.push({ date: p.paid_at, type: "PAYMENT", description: "دفعة", debitCents: "0", creditCents: p.amount_cents.toString(), balanceCents: balance.toString() }); }
    movements.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      customer: { id: c.id, name: c.name, phone: c.phone, nationalId: c.national_id },
      generatedAt: new Date().toISOString(),
      summary: { totalDebts: debts.length, totalPrincipalCents: totalPrincipal.toString(), totalPrincipalPaid: totalPaid.toString(), remainingBalance: (totalPrincipal - totalPaid).toString(), overdueInstallments: installments.filter((i: any) => i.status === 'OVERDUE').length },
      installments: { total: installments.length, paid: installments.filter((i: any) => i.status === 'PAID').length, overdue: installments.filter((i: any) => i.status === 'OVERDUE').length, pending: installments.filter((i: any) => i.status === 'PENDING').length },
      movements,
    };
  });
}
