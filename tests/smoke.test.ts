import { assertEquals } from "jsr:@std/assert";

Deno.test("smoke", () => {
  assertEquals(1 + 1, 2);
});
