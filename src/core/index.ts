// src/core/index.ts — الـ Financial Kernel الموحد
// استخدم من هنا فقط — مش من أي مكان تاني
export { Money, MoneyError }                    from "./Money.ts";
export { buildAmortizationSchedule }            from "./Amortization.ts";
export { assertBalanced, makeDebtEntry, makePaymentEntry, makeReversalEntry, JournalError } from "./Journal.ts";
export type { JournalEntry, JournalLine, AccountCode } from "./Journal.ts";
export type { InstallmentRow, AmortizationResult }     from "./Amortization.ts";
export { applyWaterfall, calculatePenalty }     from "./PaymentWaterfall.ts";
export type { WaterfallInput, WaterfallResult } from "./PaymentWaterfall.ts";
