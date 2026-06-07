import { assertEquals } from "@std/assert";
import { Money } from "./Money.ts";

Deno.test("Money: Should correctly add two amounts", () => {
  const m1 = Money.fromCents(100n);
  const m2 = Money.fromCents(200n);
  const result = m1.add(m2);
  assertEquals(result.cents, 300n);
});
