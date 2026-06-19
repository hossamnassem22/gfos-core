// src/core/Journal.ts
// ═══════════════════════════════════════════════════════════════
// DOUBLE-ENTRY JOURNAL — القلب المالي
// القاعدة الذهبية: Σ DEBIT = Σ CREDIT دايماً — لا استثناء
// الـ entries immutable — التصحيح بـ reversal مش بـ delete
// ═══════════════════════════════════════════════════════════════

export type AccountCode =
  | "CASH_ASSET"       // نقدية — مدين عند الاستلام
  | "LOAN_RECEIVABLE"  // ذمم مدينة — مدين عند إنشاء الدين
  | "UNEARNED_INCOME"  // إيراد غير مكتسب — دائن عند إنشاء الدين
  | "INTEREST_INCOME"  // إيراد فائدة — دائن عند الدفع
  | "PENALTY_INCOME"   // إيراد غرامات — دائن عند الدفع
  | "BAD_DEBT_EXPENSE";// مصروف ديون معدومة

export type EntryType = "DEBIT" | "CREDIT";

export interface JournalLine {
  account:        AccountCode;
  type:           EntryType;
  amountMillimes: bigint;
  description:    string;
}

export interface JournalEntry {
  id:          string;
  tenantId:    string;
  reference:   string;   // مرجع فريد: DEBT-{id} أو PMT-{id}
  description: string;
  currency:    "EGP";
  lines:       JournalLine[];
  createdAt:   Date;
}

// ── Validation ────────────────────────────────────────────────

export class JournalError extends Error {
  constructor(msg: string) { super(msg); this.name = "JournalError"; }
}

export function assertBalanced(lines: JournalLine[]): void {
  if (lines.length < 2) {
    throw new JournalError("Journal entry must have at least 2 lines");
  }
  let totalDebit  = 0n;
  let totalCredit = 0n;
  for (const line of lines) {
    if (line.amountMillimes <= 0n) {
      throw new JournalError(`Line amount must be > 0: account=${line.account}`);
    }
    if (line.type === "DEBIT") totalDebit  += line.amountMillimes;
    else                       totalCredit += line.amountMillimes;
  }
  if (totalDebit !== totalCredit) {
    throw new JournalError(
      `UNBALANCED: Debit=${totalDebit} Credit=${totalCredit} Diff=${totalDebit - totalCredit}`
    );
  }
}

// ── القيد #1: إنشاء دين ─────────────────────────────────────
// DR LOAN_RECEIVABLE  ← نستحق على العميل
// CR UNEARNED_INCOME  ← إيراد لم نكسبه بعد
export function makeDebtEntry(params: {
  tenantId:          string;
  debtId:            string;
  principalMillimes: bigint;
}): JournalEntry {
  const lines: JournalLine[] = [
    { account: "LOAN_RECEIVABLE", type: "DEBIT",  amountMillimes: params.principalMillimes, description: `Debt issued: ${params.debtId}` },
    { account: "UNEARNED_INCOME", type: "CREDIT", amountMillimes: params.principalMillimes, description: `Unearned income: ${params.debtId}` },
  ];
  assertBalanced(lines);
  return { id: crypto.randomUUID(), tenantId: params.tenantId, reference: `DEBT-${params.debtId}`, description: "Debt Agreement Created", currency: "EGP", lines, createdAt: new Date() };
}

// ── القيد #2: استلام دفعة ────────────────────────────────────
// DR CASH_ASSET
// CR PENALTY_INCOME   (غرامات أولاً)
// DR UNEARNED_INCOME + CR INTEREST_INCOME  (اعتراف بالفائدة)
// CR LOAN_RECEIVABLE  (سداد الأصل)
export function makePaymentEntry(params: {
  tenantId:          string;
  paymentId:         string;
  totalMillimes:     bigint;
  principalMillimes: bigint;
  interestMillimes:  bigint;
  penaltyMillimes:   bigint;
}): JournalEntry {
  const { totalMillimes, principalMillimes, interestMillimes, penaltyMillimes } = params;

  // تحقق داخلي
  if (principalMillimes + interestMillimes + penaltyMillimes !== totalMillimes) {
    throw new JournalError(
      `Payment breakdown mismatch: ${principalMillimes}+${interestMillimes}+${penaltyMillimes} ≠ ${totalMillimes}`
    );
  }

  const lines: JournalLine[] = [];

  // 1. نقدية واردة
  lines.push({ account: "CASH_ASSET", type: "DEBIT", amountMillimes: totalMillimes, description: `Payment: ${params.paymentId}` });

  // 2. غرامات
  if (penaltyMillimes > 0n) {
    lines.push({ account: "PENALTY_INCOME", type: "CREDIT", amountMillimes: penaltyMillimes, description: `Penalty: ${params.paymentId}` });
  }

  // 3. فائدة — اعتراف من UNEARNED إلى INTEREST_INCOME
  if (interestMillimes > 0n) {
    lines.push({ account: "UNEARNED_INCOME",  type: "DEBIT",  amountMillimes: interestMillimes, description: `Earn interest: ${params.paymentId}` });
    lines.push({ account: "INTEREST_INCOME",  type: "CREDIT", amountMillimes: interestMillimes, description: `Interest income: ${params.paymentId}` });
  }

  // 4. أصل — يُقلل الذمة المدينة
  if (principalMillimes > 0n) {
    lines.push({ account: "LOAN_RECEIVABLE", type: "CREDIT", amountMillimes: principalMillimes, description: `Principal repaid: ${params.paymentId}` });
  }

  assertBalanced(lines);
  return { id: crypto.randomUUID(), tenantId: params.tenantId, reference: `PMT-${params.paymentId}`, description: "Payment Received", currency: "EGP", lines, createdAt: new Date() };
}

// ── القيد #3: عكس (Reversal) ─────────────────────────────────
// مش حذف — قيد معاكس جديد
export function makeReversalEntry(original: JournalEntry, reason: string): JournalEntry {
  const reversedLines: JournalLine[] = original.lines.map(l => ({
    ...l,
    type: l.type === "DEBIT" ? "CREDIT" as const : "DEBIT" as const,
    description: `REV: ${l.description}`,
  }));
  assertBalanced(reversedLines);
  return { id: crypto.randomUUID(), tenantId: original.tenantId, reference: `REV-${original.reference}`, description: `Reversal: ${reason}`, currency: "EGP", lines: reversedLines, createdAt: new Date() };
}
