export async function customersSummaryRoutes(app: any) {
  app.get("/customers/summary", async (_req, reply) => {
    return {
      success: true,
      data: {
        message: "Use /customers/portfolio instead of summary endpoint",
      },
    };
  });
}
