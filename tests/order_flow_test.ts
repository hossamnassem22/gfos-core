import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { sql } from "@infra/database/connection.ts";

Deno.test("Day 3: Order Flow Test", async () => {
  // تنظيف شامل للبدء بنظافة
  await sql`TRUNCATE TABLE orders, order_items, customers, products, merchants CASCADE`;
  
  const merchantRepo = new MerchantRepository();
  const productRepo = new ProductRepository();
  const orderRepo = new OrderRepository();

  const mId = await merchantRepo.create({ name: "محل العطار", phone: "0101" });
  const pId = await productRepo.add({ merchant_id: mId, title: "زيت", price: 100, stock: 10 });

  // تنفيذ طلب بيع
  const orderId = await orderRepo.create({
    merchantId: mId,
    customerPhone: "0122",
    totalAmount: 100,
    items: [{ productId: pId, quantity: 1, price: 100 }]
  });

  const orderCheck = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  assertEquals(orderCheck.length, 1);
  console.log("✅ Day 3 Passed: Order successfully created and linked.");
});
