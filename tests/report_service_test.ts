import { ReportService } from "@src/services/ReportService.ts";
import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { sql } from "@infra/database/connection.ts";

Deno.test("Day 5: Daily Report Test", async () => {
  await sql`TRUNCATE TABLE ledger_entries, orders, order_items, customers, products, merchants CASCADE`;
  
  const mRepo = new MerchantRepository();
  const pRepo = new ProductRepository();
  const oRepo = new OrderRepository();
  const reportSvc = new ReportService();

  const mId = await mRepo.create({ name: "محل الجملة", phone: "0105" });
  const pId = await pRepo.add({ merchant_id: mId, title: "سلعة", price: 500, stock: 10 });

  // عمليتين بيع
  await oRepo.create({ merchantId: mId, customerPhone: "011", totalAmount: 500, items: [{ productId: pId, quantity: 1, price: 500 }] });
  await oRepo.create({ merchantId: mId, customerPhone: "012", totalAmount: 500, items: [{ productId: pId, quantity: 1, price: 500 }] });

  const report = await reportSvc.getMerchantDailyReport(mId);
  
  assertEquals(Number(report.total_orders), 2);
  assertEquals(Number(report.total_sales), 1000);
  
  console.log("✅ Day 5 Passed: Daily report generated successfully.");
});
