import { Router } from "npm:express";
import { AgreementController } from "../controllers/AgreementController.ts";
import { validateAgreement } from "../middleware/validateAgreement.ts";

const router = Router();

// مسار توثيق اتفاقية دين جديدة مع التحقق من صحة البيانات
router.post("/agreements", validateAgreement, AgreementController.create);

export default router;
