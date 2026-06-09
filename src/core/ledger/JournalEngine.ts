import { JournalEntry, JournalLine, AccountCode } from "./types.ts";

export class JournalEngine {

  static createPaymentEntry(opts: {
    tenantId:      string;
    reference:     string;
    currency:      string;
    amountCents:   bigint;
    principalCents: bigint;
    interestCents: bigint;
    penaltiesCents: bigint;
  }): JournalEntry {
    const lines: JournalLine[] = [];

    // Debit: Cash Asset (المبلغ الكلي)
    lines.push({ account: "CASH_ASSET", type: "DEBIT", amount: opts.amountCents });

    // Credit: Loan Receivable (الأصل)
    if (opts.principalCents > 0n)
      lines.push({ account: "LOAN_RECEIVABLE", type: "CREDIT", amount: opts.principalCents });

    // Credit: Interest Income (الفائدة)
    if (opts.interestCents > 0n)
      lines.push({ account: "INTEREST_INCOME", type: "CREDIT", amount: opts.interestCents });

    // Credit: Penalty Income (الغرامات)
    if (opts.penaltiesCents > 0n)
      lines.push({ account: "PENALTY_INCOME", type: "CREDIT", amount: opts.penaltiesCents });

    JournalEngine.assertBalanced(lines);

    return {
      id:          crypto.randomUUID(),
      tenantId:    opts.tenantId,
      reference:   opts.reference,
      description: "Payment Received",
      currency:    opts.currency,
      lines,
      createdAt:   new Date(),
    };
  }

  static createDebtEntry(opts: {
    tenantId:      string;
    reference:     string;
    currency:      string;
    principalCents: bigint;
  }): JournalEntry {
    const lines: JournalLine[] = [
      { account: "LOAN_RECEIVABLE", type: "DEBIT",  amount: opts.principalCents },
      { account: "UNEARNED_INCOME", type: "CREDIT", amount: opts.principalCents },
    ];

    JournalEngine.assertBalanced(lines);

    return {
      id:          crypto.randomUUID(),
      tenantId:    opts.tenantId,
      reference:   opts.reference,
      description: "Debt Agreement Created",
      currency:    opts.currency,
      lines,
      createdAt:   new Date(),
    };
  }

  static assertBalanced(lines: JournalLine[]): void {
    const debits  = lines.filter(l => l.type === "DEBIT") .reduce((s, l) => s + l.amount, 0n);
    const credits = lines.filter(l => l.type === "CREDIT").reduce((s, l) => s + l.amount, 0n);
    if (debits !== credits)
      throw new Error(`Unbalanced journal entry: debits=${debits} credits=${credits}`);
  }
}
