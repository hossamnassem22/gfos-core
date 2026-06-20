import { Router } from "express";
import { getOverdueInstallments } from "../controllers/dashboard.ts";

const dashboardRouter = Router();

// مسار لجلب الأقساط المتأخرة
dashboardRouter.get("/overdue-installments", getOverdueInstallments);

export { dashboardRouter };
