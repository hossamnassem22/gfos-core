import { notificationService } from "../../../application/boundary/index.ts";

export async function notificationRoutes(app: any) {
  app.get("/notifications", async (req: any, rep: any) => {
    return notificationService.list(req, rep);
  });
}
