import { Router } from "express";
import { getOverdueInstallments } from "../controllers/dashboard";

const dashboardRouter = Router();

// مسار لجلب الأقساط المتأخرة
dashboardRouter.get("/overdue-installments", getOverdueInstallments);

export { dashboardRouter };
