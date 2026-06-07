import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { FinancialEngine } from "@core/financial-engine/financial-engine.ts";
import { Money } from "@core/precision/value-objects.ts";

const engine = new FinancialEngine();
const EGP = (cents: bigint) => Money.fromCents(cents, "EGP");

Deno.test("Interest: 10,000 جنيه بفائدة 12% سنوياً لمدة 30 يوم", () => {
  // 10000 * 1200bps * 30 / 3,650,000 = 98.6 → 98 قرش (integer division)
  const result = engine.calculateInterest(
    EGP(1000000n),   // 10,000 جنيه
    { bps: 1200 },   // 12%
    30
  );
  assertEquals(result.cents, 9863n); // 98.63 جنيه
  assertEquals(result.currency, "EGP");
});

Deno.test("Interest: أصل صفر = فائدة صفر", () => {
  const result = engine.calculateInterest(EGP(0n), { bps: 1200 }, 30);
  assertEquals(result.cents, 0n);
});

Deno.test("Penalty: 5,000 جنيه متأخر بغرامة 2% سنوياً لمدة 10 أيام", () => {
  // 500000 * 200 * 10 / 3,650,000 = 27.39 → 27
  const result = engine.calculatePenalty(
    EGP(500000n),  // 5,000 جنيه
    { bps: 200 },  // 2%
    10
  );
  assertEquals(result.cents, 273n);
  assertEquals(result.currency, "EGP");
});
