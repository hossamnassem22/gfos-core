import type { FastifyInstance } from "npm:fastify";

export async function agreementRoutes(app: FastifyInstance) {
  app.get("/agreements", async () => {
    return {
      success: true,
      data: [],
      message: "Agreements fetched successfully",
    };
  });

  app.post("/agreements", async (req) => {
    const body = req.body as any;

    return {
      success: true,
      message: "Agreement created successfully",
      data: body,
    };
  });

  app.get("/agreements/:id", async (req) => {
    const { id } = req.params as any;

    return {
      success: true,
      data: { id },
    };
  });

  app.delete("/agreements/:id", async (req) => {
    const { id } = req.params as any;

    return {
      success: true,
      message: `Agreement ${id} deleted`,
    };
  });
}
