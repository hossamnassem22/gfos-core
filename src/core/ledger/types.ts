export type AccountCode =
  | "CASH_ASSET"
  | "LOAN_RECEIVABLE"
  | "INTEREST_INCOME"
  | "PENALTY_INCOME"
  | "UNEARNED_INCOME"
  | "BAD_DEBT_EXPENSE";

export type EntryType = "DEBIT" | "CREDIT";

export interface JournalLine {
  account: AccountCode;
  type:    EntryType;
  amount:  bigint;
}

export interface JournalEntry {
  id:          string;
  tenantId:    string;
  reference:   string;
  description: string;
  currency:    string;
  lines:       JournalLine[];
  createdAt:   Date;
}

export interface TrialBalanceRow {
  account:      AccountCode;
  totalDebits:  bigint;
  totalCredits: bigint;
  balance:      bigint;
}
