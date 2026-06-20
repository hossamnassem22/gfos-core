import { LedgerPostingService } from "../../../application/services/LedgerPostingService.ts";

const service = new LedgerPostingService();

export async function ledgerRoutes(app: any) {
  app.get("/ledger", (req: any, rep: any) => {
    return service.getLedger(req, rep);
  });

  app.post("/ledger/post", (req: any, rep: any) => {
    return service.post(req, rep);
  });
}
