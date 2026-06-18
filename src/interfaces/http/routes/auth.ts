import { FastifyInstance } from "npm:fastify";
import { AuthService } from "../../infrastructure/auth/AuthService.ts";

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance) {

  app.post("/auth/register", async (req, reply) => {
    const { username, email, password } = req.body as any;
    if (!username || !email || !password)
      return reply.status(400).send({ error: "بيانات ناقصة" });
    try {
      const token = await authService.register(username, email, password);
      return { token, message: "تم التسجيل بنجاح" };
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  app.post("/auth/login", async (req, reply) => {
    const { email, password } = req.body as any;
    if (!email || !password)
      return reply.status(400).send({ error: "بيانات ناقصة" });
    try {
      const token = await authService.login(email, password);
      return { token, message: "تم تسجيل الدخول بنجاح" };
    } catch (e: any) {
      return reply.status(401).send({ error: e.message });
    }
  });
}
