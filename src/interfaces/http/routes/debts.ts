import { debtService } from "../../../application/boundary/index.ts";

export async function debtRoutes(app: any) {
  app.get("/debts", async (req: any, rep: any) => {
    return debtService.list(req, rep);
  });

  app.get("/debts/:id", async (req: any, rep: any) => {
    return debtService.get(req, rep);
  });
}
