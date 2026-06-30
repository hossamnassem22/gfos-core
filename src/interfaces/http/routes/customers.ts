import type { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructure/database/connection.ts";

export async function customersRoutes(app: FastifyInstance) {

  app.get("/customers", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    return sql`SELECT * FROM customers WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`;
  });

  app.get("/customers/portfolio", async (req: any) => {
    const tenantId = req.user?.userId?.toString() ?? "1";
    return sql`SELECT * FROM customer_portfolio_summary WHERE tenant_id = ${tenantId}` 
      .catch(() => sql`
        SELECT c.id as customer_id, c.name, c.phone,
          COUNT(d.id) as debt_count,
          COALESCE(SUM(d.principal_cents),0) as total_principal_cents,
          COUNT(s.id) FILTER (WHERE s.status='OVERDUE') as overdue_installments,
          COALESCE(SUM(s.total_payment_cents) FILTER (WHERE s.status='OVERDUE'),0) as overdue_amount_cents
        FROM customers c
        LEFT JOIN debt_agreements d ON d.customer_id = c.id
        LEFT JOIN amortization_schedule s ON s.debt_id = d.id
        WHERE c.tenant_id = ${tenantId}
        GROUP BY c.id, c.name, c.phone
        ORDER BY c.name
      `);
  });

  app.get("/customers/:id", async (req: any, reply: any) => {
    const { id } = req.params;
    const customers = await sql`SELECT * FROM customers WHERE id = ${id}`;
    if (!customers.length) return reply.status(404).send({ error: "العميل غير موجود" });
    const debts = await sql`SELECT * FROM debt_agreements WHERE customer_id = ${id} ORDER BY created_at DESC`;
    return { customer: customers[0], debts };
  });

  app.post("/customers", async (req: any) => {
    const { name, phone, nationalId, email } = req.body;
    const tenantId = req.user?.userId?.toString() ?? "1";
    const rows = await sql`
      INSERT INTO customers (name, phone, national_id, email, tenant_id)
      VALUES (${name}, ${phone}, ${nationalId ?? null}, ${email ?? null}, ${tenantId})
      RETURNING *
    `;
    return rows[0];
  });
}
