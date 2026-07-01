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
      // TODO: persist to Postgres via repository
      return jsonResponse({ id, ...payload }, 201);
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
