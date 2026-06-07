import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { DebtRepository } from "@infra/persistence/DebtRepository.ts";
import { sql } from "@infra/database/connection.ts";

Deno.test("Security: Tenant Isolation Test", async () => {
  // 1. تنظيف شامل باستخدام CASCADE لإزالة البيانات المرتبطة تلقائياً
  await sql`TRUNCATE TABLE debt_agreements, amortization_schedule, payments RESTART IDENTITY CASCADE`;
  
  const debtRepo = new DebtRepository();

  // 2. إنشاء دين لـ Tenant A
  await debtRepo.save({
    userId: "TENANT-A",
    principalCents: 50000n,
    currency: "EGP",
    annualRateBps: 1000,
    termMonths: 6,
    amortType: "DECLINING",
    status: "ACTIVE"
  });

  // 3. إنشاء دين لـ Tenant B
  await debtRepo.save({
    userId: "TENANT-B",
    principalCents: 75000n,
    currency: "EGP",
    annualRateBps: 1000,
    termMonths: 6,
    amortType: "DECLINING",
    status: "ACTIVE"
  });

  // 4. استعلام بيانات Tenant A فقط
  const debtsA = await debtRepo.findByUser("TENANT-A");
  
  // التأكد أن الـ List تحتوي فقط على دين Tenant A
  assertEquals(debtsA.length, 1, "TENANT-A should have exactly 1 record");
  assertEquals(debtsA[0].userId, "TENANT-A");
  
  const hasB = debtsA.some(d => d.userId === "TENANT-B");
  assertEquals(hasB, false);

  console.log("🛡️ Tenant Isolation Passed: No data leakage.");
});
