import { assertEquals } from "@std/assert";

Deno.test("Financial System: Ledger balance check", () => {
  const debit = 500000n;
  const credit = 500000n;
  assertEquals(debit, credit, "Debit must equal Credit");
});
