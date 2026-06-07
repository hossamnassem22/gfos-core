import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { sql } from "@infra/database/connection.ts";

Deno.test("Day 4: GFOS Ledger Integration Test", async () => {
  // تنظيف شامل
  await sql`TRUNCATE TABLE ledger_entries, orders, order_items, customers, products, merchants CASCADE`;
  
  const merchantRepo = new MerchantRepository();
  const productRepo = new ProductRepository();
  const orderRepo = new OrderRepository();

  const mId = await merchantRepo.create({ name: "موزع الجملة", phone: "0100" });
  const pId = await productRepo.add({ merchant_id: mId, title: "منظفات", price: 250, stock: 100 });

  // تنفيذ طلب بيع (الذي سيقوم آلياً بتسجيل قيد في الـ Ledger)
  await orderRepo.create({
    merchantId: mId,
    customerPhone: "0111",
    totalAmount: 250,
    items: [{ productId: pId, quantity: 1, price: 250 }]
  });

  // التحقق من أن القيد تم إنشاؤه في الـ Ledger
  const ledgerEntries = await sql`SELECT * FROM ledger_entries WHERE merchant_id = ${mId}`;
  
  assertEquals(ledgerEntries.length, 1, "Ledger entry should have been created automatically");
  assertEquals(ledgerEntries[0].type, "SALE");
  assertEquals(parseFloat(ledgerEntries[0].amount), 250);

  console.log("✅ Day 4 Passed: Financial Ledger updated automatically.");
});
