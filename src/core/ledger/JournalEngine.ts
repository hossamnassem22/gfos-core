import { JournalEntry, JournalLine, AccountCode } from "./types.ts";

export class JournalEngine {

  static createPaymentEntry(params: {
    tenantId:       string;
    reference:      string;
    currency:       string;
    amountCents:    bigint;
    principalCents: bigint;
    interestCents:  bigint;
    penaltiesCents: bigint;
  }): JournalEntry {
    const lines: JournalLine[] = [];

    lines.push({ account: "CASH_ASSET", type: "DEBIT", amount: params.amountCents });

    if (params.principalCents > 0n)
      lines.push({ account: "LOAN_RECEIVABLE", type: "CREDIT", amount: params.principalCents });

    if (params.interestCents > 0n)
      lines.push({ account: "INTEREST_INCOME", type: "CREDIT", amount: params.interestCents });

    if (params.penaltiesCents > 0n)
      lines.push({ account: "PENALTY_INCOME", type: "CREDIT", amount: params.penaltiesCents });

    return {
      id:          crypto.randomUUID(),
      tenantId:    params.tenantId,
      reference:   params.reference,
      description: "Payment Received",
      currency:    params.currency,
      createdAt:   new Date(),
      lines,
    };
  }

  static createDebtEntry(params: {
    tenantId:       string;
    reference:      string;
    currency:       string;
    principalCents: bigint;
  }): JournalEntry {
    return {
      id:          crypto.randomUUID(),
      tenantId:    params.tenantId,
      reference:   params.reference,
      description: "Debt Agreement Created",
      currency:    params.currency,
      createdAt:   new Date(),
      lines: [
        { account: "LOAN_RECEIVABLE", type: "DEBIT",  amount: params.principalCents },
        { account: "UNEARNED_INCOME", type: "CREDIT", amount: params.principalCents },
      ],
    };
  }

  static assertBalanced(lines: JournalLine[]): void {
    const debits  = lines.filter(l => l.type === "DEBIT") .reduce((s, l) => s + l.amount, 0n);
    const credits = lines.filter(l => l.type === "CREDIT").reduce((s, l) => s + l.amount, 0n);
    if (debits !== credits)
      throw new Error(`Unbalanced: debits=${debits} credits=${credits}`);
  }
}
