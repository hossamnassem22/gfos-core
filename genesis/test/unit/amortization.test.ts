import { assertEquals, assertGreater } from "https://deno.land/std/testing/asserts.ts";
import { AmortizationEngine } from "@core/financial-engine/amortization.ts";

const engine = new AmortizationEngine();
const START = new Date("2025-01-01");

Deno.test("Flat: 12,000 جنيه / 12 شهر / 12% سنوياً", () => {
  const schedule = engine.generate({
    principalCents: 1200000n, // 12,000 جنيه
    currency: "EGP",
    annualRateBps: 1200,      // 12%
    termMonths: 12,
    startDate: START,
    type: "FLAT",
  });

  assertEquals(schedule.length, 12, "12 قسط");
  assertEquals(schedule[0].principalCents, 100000n, "أصل شهري = 1000 جنيه");
  assertEquals(schedule[11].remainingBalanceCents, 0n, "رصيد نهائي = صفر");

  const { totalPrincipal, totalInterest } = engine.totalCost(schedule);
  assertEquals(totalPrincipal, 1200000n, "إجمالي الأصل");
  assertGreater(totalInterest, 0n, "إجمالي الفوائد > 0");
});

Deno.test("Declining: الفائدة تتناقص مع الوقت", () => {
  const schedule = engine.generate({
    principalCents: 1200000n,
    currency: "EGP",
    annualRateBps: 1200,
    termMonths: 12,
    startDate: START,
    type: "DECLINING",
  });

  assertEquals(schedule.length, 12);
  assertEquals(schedule[11].remainingBalanceCents, 0n);

  // الفائدة في القسط الأول أكبر من الأخير
  assertGreater(schedule[0].interestCents, schedule[11].interestCents, "فائدة متناقصة");

  const { totalPrincipal } = engine.totalCost(schedule);
  assertEquals(totalPrincipal, 1200000n);
});

Deno.test("Balloon: أقساط فوائد فقط ثم الأصل في النهاية", () => {
  const schedule = engine.generate({
    principalCents: 1200000n,
    currency: "EGP",
    annualRateBps: 1200,
    termMonths: 6,
    startDate: START,
    type: "BALLOON",
  });

  assertEquals(schedule.length, 6);

  // كل الأقساط ما عدا الأخير: أصل = صفر
  for (let i = 0; i < 5; i++) {
    assertEquals(schedule[i].principalCents, 0n, `قسط ${i + 1}: لا أصل`);
  }

  // القسط الأخير: الأصل كاملاً
  assertEquals(schedule[5].principalCents, 1200000n, "القسط الأخير = الأصل كاملاً");
  assertEquals(schedule[5].remainingBalanceCents, 0n, "رصيد نهائي = صفر");
});

Deno.test("Flat: تواريخ الاستحقاق صحيحة", () => {
  const schedule = engine.generate({
    principalCents: 600000n,
    currency: "EGP",
    annualRateBps: 600,
    termMonths: 3,
    startDate: START,
    type: "FLAT",
  });

  assertEquals(schedule[0].dueDate.getMonth(), 1, "فبراير");
  assertEquals(schedule[1].dueDate.getMonth(), 2, "مارس");
  assertEquals(schedule[2].dueDate.getMonth(), 3, "أبريل");
});
