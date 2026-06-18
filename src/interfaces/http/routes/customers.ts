import { FastifyInstance } from "npm:fastify";
import { sql } from "../../../infrastructu../../infrastructure/database/connection.ts";
import { requireAuth } from "../middleware/auth.ts";

export async function customerRoutes(app: FastifyInstance) {

  // إنشاء عميل جديد
  app.post("/customers", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { name, phone, nationalId, email } = req.body as any;
    if (!name || !phone)
      return reply.status(400).send({ error: "الاسم والهاتف مطلوبان" });
    const rows = await sql`
      INSERT INTO customers (tenant_id, name, phone, national_id, email)
      VALUES (${userId}, ${name}, ${phone}, ${nationalId ?? null}, ${email ?? null})
      RETURNING *
    `;
    return { customer: rows[0] };
  });

  // جلب عملاء الـ tenant
  app.get("/customers", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const rows = await sql`
      SELECT c.*, COUNT(d.id) AS debt_count
      FROM customers c
      LEFT JOIN debt_agreements d ON d.customer_id = c.id
      WHERE c.tenant_id = ${userId}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    return rows;
  });

  // جلب عميل واحد مع ديونه
  app.get("/customers/:id", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params as any;
    const [customer] = await sql`
      SELECT * FROM customers WHERE id = ${id} AND tenant_id = ${userId}
    `;
    if (!customer) return reply.status(404).send({ error: "العميل غير موجود" });
    const debts = await sql`
      SELECT * FROM debt_agreements WHERE customer_id = ${id} ORDER BY created_at DESC
    `;
    return { customer, debts };
  });
// Portfolio summary لكل عملاء الـ tenant
  app.get("/customers/portfolio", { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = (req as any).user;
    const rows = await sql`
      SELECT * FROM customer_portfolio_summary
      WHERE tenant_id = ${userId}
      ORDER BY overdue_amount_cents DESC, total_principal_cents DESC
    `;
    return rows;
  });}

	
