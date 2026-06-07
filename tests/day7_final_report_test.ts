import { SalesmanReportService } from "@src/services/SalesmanReportService.ts";
import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { sql } from "@infra/database/connection.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";

Deno.test("Day 7: Final Performance Report Test", async () => {
  await sql`TRUNCATE TABLE ledger_entries, orders, order_items, customers, products, salesmen, merchants CASCADE`;
  
  // إعداد البيانات
  const [m] = await sql`INSERT INTO merchants (name, phone) VALUES ('موزع الجملة', '0100') RETURNING id`;
  const [s] = await sql`INSERT INTO salesmen (merchant_id, name, commission_rate) VALUES (${m.id}, 'أحمد المندوب', 0.05) RETURNING id`;
  const [p] = await sql`INSERT INTO products (merchant_id, title, price) VALUES (${m.id}, 'بضاعة', 1000) RETURNING id`;
  
  // تحديث النسبة
  await sql`UPDATE salesmen SET commission_rate = 0.10 WHERE id = ${s.id}`;
  
  const oRepo = new OrderRepository();
  await oRepo.create({ 
    merchantId: m.id, 
    customerPhone: "01", 
    salesmanId: s.id, 
    totalAmount: 1000, 
    items: [{ productId: p.id, quantity: 1, price: 1000 }] 
  });

  // استخراج التقرير باستخدام الدالة الصحيحة
  const reportSvc = new SalesmanReportService();
  const report = await reportSvc.getSalesmanPerformance(m.id);

  assertEquals(report[0].salesman_name, 'أحمد المندوب');
  assertEquals(parseFloat(report[0].total_commission_earned), 100);

  console.log("🚀 Day 7 Passed: Final performance report generated!");
});
