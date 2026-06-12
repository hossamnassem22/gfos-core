import { FastifyInstance } from "npm:fastify";

const MAX_BODY_SIZE = 10_000; // 10KB

export async function validateInput(app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    // التحقق من حجم الطلب
    if (req.body && JSON.stringify(req.body).length > MAX_BODY_SIZE) {
      return reply.status(413).send({ error: "Request body too large" });
    }

    // التحقق من أنماط SQL injection البسيطة في المعاملات
    const dangerousPatterns = /(\bDROP\b|\bDELETE\b|\bTRUNCATE\b|\bINSERT\b|\bUPDATE\b|--|;|\/\*)/i;
    const params = Object.values(req.params as Record<string, string>);
    
    for (const param of params) {
      if (dangerousPatterns.test(param)) {
        return reply.status(400).send({ error: "Invalid input" });
      }
    }
  });
}
