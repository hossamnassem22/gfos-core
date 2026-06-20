import Fastify from "npm:fastify";
import { registerRoutes } from "./routeRegistry.ts";

export async function startHttpServer() {
  const app = Fastify({ logger: false });

  await registerRoutes(app);

  const PORT = Number(Deno.env.get("PORT") ?? 3011);

  await app.listen({ port: PORT, host: "0.0.0.0" });

  console.log(`✅ Server running on http://localhost:${PORT}`);
}

// Start the server
await startHttpServer();
