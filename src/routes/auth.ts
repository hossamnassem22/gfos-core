import { FastifyInstance } from "npm:fastify";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async () => {
    return {
      token: "demo-token",
      message: "auth working"
    };
  });

  app.post("/auth/register", async () => {
    return {
      message: "register working"
    };
  });
}
