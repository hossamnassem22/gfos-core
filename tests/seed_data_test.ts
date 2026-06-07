import { MerchantRepository } from "@infra/persistence/MerchantRepository.ts";
import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";

Deno.test("Day 2: System Bootstrapping Test", async () => {
  const merchantRepo = new MerchantRepository();
  const productRepo = new ProductRepository();

  // 1. تسجيل تاجر
  const merchantId = await merchantRepo.create({
    name: "محل العطار",
    phone: "01000000000"
  });
  
  // 2. إضافة منتج لنفس التاجر
  const productId = await productRepo.add({
    merchant_id: merchantId,
    title: "زيت زيتون بكر",
    price: 150.00,
    stock: 50
  });

  // 3. التحقق
  const merchant = await merchantRepo.findByPhone("01000000000");
  const products = await productRepo.listByMerchant(merchantId);

  assertEquals(merchant?.name, "محل العطار");
  assertEquals(products.length, 1);
  assertEquals(products[0].title, "زيت زيتون بكر");
  
  console.log("✅ Day 2 Passed: Merchant and Product created successfully.");
});
