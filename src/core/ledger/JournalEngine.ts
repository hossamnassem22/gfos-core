import { JournalEntry, AccountCode } from "./types.ts";

export class JournalEngine {
  static createPaymentEntry(params: {
    tenantId: string;
    reference: string;
    currency: string;
    amountCents: bigint;
    principalCents: bigint;
    interestCents: bigint;
    penaltiesCents: bigint;
  }): JournalEntry {
    return {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      reference: params.reference,
      description: "Payment entry",
      currency: params.currency,
      createdAt: new Date(),
      lines: [
        { account: "CASH" as AccountCode, type: "DEBIT", amount: params.amountCents },
        { account: "LOAN_RECEIVABLE" as AccountCode, type: "CREDIT", amount: params.principalCents },
        { account: "INTEREST_INCOME" as AccountCode, type: "CREDIT", amount: params.interestCents },
        { account: "PENALTY_INCOME" as AccountCode, type: "CREDIT", amount: params.penaltiesCents }
      ]
    };
  }
}
