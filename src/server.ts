import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PORT = Number(Deno.env.get("PORT") ?? 3000);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === "/health" && req.method === "GET") {
    return jsonResponse({ status: "ok", time: new Date().toISOString() });
  }

  if (url.pathname === "/api/customers" && req.method === "POST") {
    try {
      const payload = await req.json();
      if (!payload.name) return jsonResponse({ error: "name required" }, 400);
      const id = crypto.randomUUID();

      // Lazy-import repository so tests that only import handler don't require DATABASE_URL
      try {
        const { createCustomer } = await import("./src/db/customerRepository.ts");
        const created = await createCustomer({ name: payload.name, email: payload.email, phone: payload.phone });
        return jsonResponse(created, 201);
      } catch (err) {
        // If DB not configured, fall back to in-memory response but indicate non-persistence
        console.error("DB error or not configured:", err?.message ?? err);
        return jsonResponse({ id, ...payload, persisted: false }, 201);
      }
    } catch (err) {
      return jsonResponse({ error: "invalid json" }, 400);
    }
  }

  return jsonResponse({ error: "not found" }, 404);
}

if (import.meta.main) {
  console.log(`Starting GFOS-Core server on :${PORT}`);
  serve(handler, { port: PORT });
}
