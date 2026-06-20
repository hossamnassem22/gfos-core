/**
 * ============================================================================
 * GFOS CORE
 * Application Boundary
 * ============================================================================
 *
 * هذا الملف هو نقطة الدخول الرسمية الوحيدة إلى طبقة Application.
 *
 * القواعد:
 * - لا يتم الاستيراد من application/services مباشرة خارج طبقة Application.
 * - جميع الخدمات التي يحتاجها HTTP أو Infrastructure يتم تصديرها من هنا.
 * - لا يحتوي هذا الملف على أي منطق أعمال (Business Logic).
 * ============================================================================
 */

/* ============================
 * Services
 * ============================ */

export { AuthService } from "../services/AuthService.ts";
export { UserService } from "../services/UserService.ts";
export { PaymentService } from "../services/PaymentService.ts";
export { DebtService } from "../services/DebtService.ts";
export { TransferService } from "../services/TransferService.ts";
export { ProfitService } from "../services/ProfitService.ts";
export { AllocationService } from "../services/AllocationService.ts";
export { LedgerPostingService } from "../services/LedgerPostingService.ts";
export { ExchangeService } from "../services/ExchangeService.ts";
export { InstallmentService } from "../services/InstallmentService.ts";
export { FinancialPolicyService } from "../services/FinancialPolicyService.ts";
export { FinanceCalculatorService } from "../services/FinanceCalculatorService.ts";
export { NotificationService } from "../services/NotificationService.ts";
export { NotificationEngine } from "../services/NotificationEngine.ts";
export { OverdueEngine } from "../services/OverdueEngine.ts";
export { SettlementEngine } from "../services/SettlementEngine.ts";

/* ============================
 * Use Cases
 * ============================ */

export * from "../use-cases/index.ts";

/* ============================
 * Commands
 * ============================ */

export * from "../commands/Command.ts";
export * from "../commands/CommandHandler.ts";

/* ============================
 * Application Ports
 * ============================ */

export * from "../ports/database.port.ts";
export * from "../ports/notification.port.ts";
export * from "../ports/user-repository.port.ts";

/* ============================
 * Engines
 * ============================ */

export { AllocationEngine } from "../engines/AllocationEngine.ts";
export { InterestEngine } from "../engines/InterestEngine.ts";
export { PenaltyEngine } from "../engines/PenaltyEngine.ts";
export { LedgerEngine } from "../engines/LedgerEngine.ts";
export { ReconciliationEngine } from "../engines/ReconciliationEngine.ts";
export { IntegrityVerifier } from "../engines/IntegrityVerifier.ts";
export { IdempotencyGate } from "../engines/IdempotencyGate.ts";
