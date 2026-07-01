import { assertEquals, assert } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { handler } from "../src/server.ts";

Deno.test("GET /health returns ok", async () => {
  const req = new Request("http://localhost/health", { method: "GET" });
  const res = await handler(req);
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, "ok");
  assert("time" in body);
});

Deno.test("POST /api/customers without DB returns persisted false", async () => {
  const payload = { name: "Test User", email: "test@example.com" };
  const req = new Request("http://localhost/api/customers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const res = await handler(req);
  // Should either persist (if DATABASE_URL provided in environment) or fallback with persisted=false
  assertEquals(res.status, 201);
  const body = await res.json();
  // If persisted property exists, it should be false in CI without DATABASE_URL
  if ("persisted" in body) {
    assertEquals(body.persisted, false);
  } else {
    // if it's persisted, ensure name matches
    assertEquals(body.name, payload.name);
  }
});
