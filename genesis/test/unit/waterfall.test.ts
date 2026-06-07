import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { PaymentWaterfall } from "@core/financial-engine/waterfall.ts";
import { Money } from "@core/precision/value-objects.ts";

const EGP = (cents: bigint) => Money.fromCents(cents, "EGP");

Deno.test("Waterfall: دفعة كاملة تغطي كل شيء", () => {
  const wf = new PaymentWaterfall();
  const result = wf.allocate({
    payment:              EGP(10000n), // 100 جنيه
    outstandingPenalties: EGP(2000n),  // 20 جنيه
    outstandingInterest:  EGP(3000n),  // 30 جنيه
    outstandingPrincipal: EGP(4000n),  // 40 جنيه
  });

  assertEquals(result.penalties.cents,  2000n, "الغرامات");
  assertEquals(result.interest.cents,   3000n, "الفوائد");
  assertEquals(result.principal.cents,  4000n, "الأصل");
  assertEquals(result.remaining.cents,  1000n, "الباقي");
});

Deno.test("Waterfall: دفعة جزئية تغطي الغرامات فقط", () => {
  const wf = new PaymentWaterfall();
  const result = wf.allocate({
    payment:              EGP(1500n),  // 15 جنيه
    outstandingPenalties: EGP(2000n),  // 20 جنيه
    outstandingInterest:  EGP(3000n),
    outstandingPrincipal: EGP(5000n),
  });

  assertEquals(result.penalties.cents,  1500n, "أخذ كل الدفعة للغرامات");
  assertEquals(result.interest.cents,   0n,    "لا شيء للفوائد");
  assertEquals(result.principal.cents,  0n,    "لا شيء للأصل");
  assertEquals(result.remaining.cents,  0n,    "لا باقي");
});

Deno.test("Waterfall: دفعة تغطي الغرامات والفوائد جزئياً", () => {
  const wf = new PaymentWaterfall();
  const result = wf.allocate({
    payment:              EGP(5000n),  // 50 جنيه
    outstandingPenalties: EGP(2000n),  // 20 جنيه
    outstandingInterest:  EGP(4000n),  // 40 جنيه
    outstandingPrincipal: EGP(8000n),
  });

  assertEquals(result.penalties.cents,  2000n, "الغرامات كاملة");
  assertEquals(result.interest.cents,   3000n, "فوائد جزئية");
  assertEquals(result.principal.cents,  0n,    "لا شيء للأصل");
  assertEquals(result.remaining.cents,  0n,    "لا باقي");
});

Deno.test("Waterfall: دفعة صفر", () => {
  const wf = new PaymentWaterfall();
  const result = wf.allocate({
    payment:              EGP(0n),
    outstandingPenalties: EGP(2000n),
    outstandingInterest:  EGP(3000n),
    outstandingPrincipal: EGP(5000n),
  });

  assertEquals(result.penalties.cents,  0n);
  assertEquals(result.interest.cents,   0n);
  assertEquals(result.principal.cents,  0n);
  assertEquals(result.remaining.cents,  0n);
});
