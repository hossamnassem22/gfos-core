import { FastifyInstance } from "npm:fastify";

export async function requestLogger(app: FastifyInstance) {
  const skip = ["/health", "/health/deep", "/metrics"];

  app.addHook("onRequest", async (req) => {
    if (!skip.includes(req.url)) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} — IP: ${req.ip}`);
    }
  });

  app.addHook("onResponse", async (req, reply) => {
    if (!skip.includes(req.url)) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} — Status: ${reply.statusCode}`);
    }
  });
}
