import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { handler } from "../src/server.ts";

Deno.test("health endpoint returns ok", async () => {
  const req = new Request("https://example.com/health", { method: "GET" });
  const res = await handler(req);
  assertEquals(res.status, 200);
  const body = await res.json();
  if (!body || typeof body.status !== "string") throw new Error("invalid body");
});
