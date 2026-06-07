import { FastifyRequest, FastifyReply } from "npm:fastify";
import jwt from "npm:jsonwebtoken";

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "selfni-dev-secret-change-in-prod";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "يجب تقديم توكن صالح" });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded; // حقن بيانات المستخدم
  } catch (e) {
    return reply.status(401).send({ error: "توكن غير صالح أو منتهي" });
  }
}
