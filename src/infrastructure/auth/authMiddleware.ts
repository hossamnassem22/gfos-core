import { FastifyRequest, FastifyReply } from "npm:fastify";
import jwt from "npm:jsonwebtoken";

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "selfni-dev-secret-change-in-prod";

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("مطلوب التوكن");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // حقن الـ userId في الطلب لاستخدامه في الـ Routes
    (req as any).user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "غير مصرح بالدخول" });
  }
}
