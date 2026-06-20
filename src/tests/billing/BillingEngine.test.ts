import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { BillingEngine } from "@modules/billing/core/BillingEngine.ts";

Deno.test("BillingEngine Calculation Integrity", () => {
  const result = BillingEngine.calculateUsage(10, 5);
  assertEquals(result, 50, "Calculation must be exact");
});
