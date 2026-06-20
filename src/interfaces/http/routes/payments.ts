import { paymentService } from "../../../application/boundary/index.ts";

export async function paymentRoutes(app: any) {
  app.post("/payments", async (req: any, rep: any) => {
    return paymentService.create(req, rep);
  });
}
