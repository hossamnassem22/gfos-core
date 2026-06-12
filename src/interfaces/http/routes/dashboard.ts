import { FastifyInstance } from "npm:fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/analytics/summary", async () => {
    return {
      status: "ok",
      message: "dashboard working"
    };
  });
}
