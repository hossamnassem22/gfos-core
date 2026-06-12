import { FastifyInstance } from "npm:fastify";

export async function securityHeaders(app: FastifyInstance) {
  app.addHook("onSend", async function(_req, reply, payload) {
    if (!reply.hasHeader("X-Content-Type-Options")) {
      reply.raw.setHeader("X-Content-Type-Options", "nosniff");
      reply.raw.setHeader("X-Frame-Options", "DENY");
      reply.raw.setHeader("X-XSS-Protection", "1; mode=block");
      reply.raw.setHeader("X-Service", "selfni-core/0.9.0");
    }
    return payload;
  });
}
