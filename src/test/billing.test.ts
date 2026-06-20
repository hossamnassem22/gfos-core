import { BillingPolicy } from "../core/billing/BillingPolicy.ts";

Deno.test("Billing policy enforces request limit", () => {
  BillingPolicy.checkRequestLimit("free", 10); // ok

  let error = false;
  try {
    BillingPolicy.checkRequestLimit("free", 200);
  } catch {
    error = true;
  }

  if (!error) {
    throw new Error("Limit not enforced");
  }
});
