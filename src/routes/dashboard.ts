import { FastifyInstance } from "npm:fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/installments", async () => {
    return [
      {
        id: "demo-1",
        amount: 1000,
        status: "PENDING"
      }
    ];
  });
}
