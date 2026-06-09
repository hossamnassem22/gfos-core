export interface LedgerEntry {
  customerId: string;
  date: Date;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  referenceId: string;
}

export interface AccountStatement {
  customerId: string;
  entries: LedgerEntry[];
}
