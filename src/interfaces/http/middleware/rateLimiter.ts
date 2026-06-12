import { FastifyInstance } from "npm:fastify";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export async function rateLimiter(app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    const exempt = ["/health", "/health/deep", "/metrics"];
    if (exempt.includes(req.url)) return;

    const ip = req.ip ?? "unknown";
    const now = Date.now();
    const window = 60_000;
    const limit = 100;

    const record = requestCounts.get(ip) ?? { count: 0, resetAt: now + window };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + window;
    } else {
      record.count++;
    }

    requestCounts.set(ip, record);

    if (record.count > limit) {
      return reply.status(429).send({ error: "Too many requests" });
    }
  });
}
