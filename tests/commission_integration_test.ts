import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { sql } from "@infra/database/connection.ts";

Deno.test("Day 6: Commission Engine Integration Test", async () => {
  await sql`TRUNCATE TABLE ledger_entries, orders, order_items, customers, products, salesmen, merchants CASCADE`;
  
  const mRepo = new MerchantRepository();
  const pRepo = new ProductRepository();
  const oRepo = new OrderRepository();

  const mId = await mRepo.create({ name: "موزع الجملة", phone: "0100" });
  const pId = await pRepo.add({ merchant_id: mId, title: "سلعة", price: 1000, stock: 10 });
  
  // إضافة مندوب
  const [salesman] = await sql`INSERT INTO salesmen (merchant_id, name, commission_rate) VALUES (${mId}, 'أحمد المندوب', 0.05) RETURNING id`;
  
  // تنفيذ طلب بيع مع المندوب
  await oRepo.create({
    merchantId: mId,
    customerPhone: "0122",
    salesmanId: salesman.id,
    totalAmount: 1000,
    items: [{ productId: pId, quantity: 1, price: 1000 }]
  });

  // التحقق: يجب أن نجد قيدين (1 للبيع + 1 للعمولة)
  const ledger = await sql`SELECT * FROM ledger_entries WHERE merchant_id = ${mId} ORDER BY type`;
  
  assertEquals(ledger.length, 2, "Should have 2 ledger entries: SALE and COMMISSION");
  const commissionEntry = ledger.find(e => e.type === 'COMMISSION');
  assertEquals(parseFloat(commissionEntry.amount), 50, "Commission should be 5% of 1000 = 50");

  console.log("✅ Day 6 Passed: Commission engine is working!");
});
