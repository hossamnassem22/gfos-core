import { assertEquals, assertGreater } from "https://deno.land/std/testing/asserts.ts";
import { DebtRestructuringEngine } from "@core/financial-engine/restructuring.ts";

const engine = new DebtRestructuringEngine();
const START = new Date("2025-06-01");

Deno.test("Restructuring: إعادة جدولة بدون إسقاط", () => {
  const result = engine.restructure({
    originalPrincipalCents:    1000000n, // 10,000 جنيه
    currency: "EGP",
    outstandingPrincipalCents: 800000n,  // 8,000 جنيه متبقي
    accruedInterestCents:      50000n,   // 500 جنيه فوائد
    accruedPenaltiesCents:     20000n,   // 200 جنيه غرامات
    newAnnualRateBps:          1000,     // 10% جديد
    newTermMonths:             12,
    newStartDate:              START,
    newType:                   "DECLINING",
  });

  // الرصيد الجديد = 8000 + 500 + 200 = 8700 جنيه
  assertEquals(result.waivedInterestCents,  0n, "لا إسقاط فوائد");
  assertEquals(result.waivedPenaltiesCents, 0n, "لا إسقاط غرامات");
  assertEquals(result.newPrincipalCents, 870000n, "رصيد جديد = 8,700 جنيه");
  assertEquals(result.schedule.length, 12, "12 قسط");
  assertEquals(result.schedule[11].remainingBalanceCents, 0n, "رصيد نهائي = صفر");
});

Deno.test("Restructuring: إسقاط 50% من الفوائد و100% من الغرامات", () => {
  const result = engine.restructure({
    originalPrincipalCents:    1000000n,
    currency: "EGP",
    outstandingPrincipalCents: 800000n,
    accruedInterestCents:      100000n,  // 1,000 جنيه فوائد
    accruedPenaltiesCents:     40000n,   // 400 جنيه غرامات
    newAnnualRateBps:          800,
    newTermMonths:             6,
    newStartDate:              START,
    newType:                   "FLAT",
    interestWaiverBps:         5000,     // إسقاط 50%
    penaltyWaiverBps:          10000,    // إسقاط 100%
  });

  assertEquals(result.waivedInterestCents,  50000n, "إسقاط 500 جنيه فوائد");
  assertEquals(result.waivedPenaltiesCents, 40000n, "إسقاط 400 جنيه غرامات كاملة");

  // رصيد جديد = 8000 + 500 (فوائد متبقية) + 0 (غرامات مسقطة) = 8500 جنيه
  assertEquals(result.newPrincipalCents, 850000n, "رصيد جديد = 8,500 جنيه");
  assertEquals(result.schedule.length, 6);
});

Deno.test("Restructuring: إسقاط كامل يقلل الرصيد للأصل فقط", () => {
  const result = engine.restructure({
    originalPrincipalCents:    500000n,
    currency: "EGP",
    outstandingPrincipalCents: 500000n,
    accruedInterestCents:      80000n,
    accruedPenaltiesCents:     30000n,
    newAnnualRateBps:          600,
    newTermMonths:             3,
    newStartDate:              START,
    newType:                   "BALLOON",
    interestWaiverBps:         10000, // 100%
    penaltyWaiverBps:          10000, // 100%
  });

  assertEquals(result.waivedInterestCents,  80000n);
  assertEquals(result.waivedPenaltiesCents, 30000n);
  assertEquals(result.newPrincipalCents,   500000n, "رصيد = الأصل فقط بعد إسقاط كامل");
  assertGreater(result.totalNewPayment, 500000n, "إجمالي الدفع > الأصل بسبب الفوائد الجديدة");
});

Deno.test("Restructuring: المدخرات مقارنة بعدم إعادة الجدولة", () => {
  const result = engine.restructure({
    originalPrincipalCents:    1000000n,
    currency: "EGP",
    outstandingPrincipalCents: 1000000n,
    accruedInterestCents:      200000n,
    accruedPenaltiesCents:     100000n,
    newAnnualRateBps:          500,      // معدل منخفض جداً
    newTermMonths:             24,
    newStartDate:              START,
    newType:                   "DECLINING",
    interestWaiverBps:         10000,    // إسقاط كامل للفوائد
    penaltyWaiverBps:          10000,    // إسقاط كامل للغرامات
  });

  // بدون إعادة جدولة: 1,000,000 + 200,000 + 100,000 = 1,300,000
  // مع إعادة جدولة وإسقاط كامل: أصل فقط + فوائد جديدة منخفضة
  assertGreater(result.savingsVsOriginal, 0n, "إعادة الجدولة توفر مبلغاً");
});
