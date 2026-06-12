import { JournalLine } from "../../core/ledger/types.ts";

export class LedgerInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerInvariantError";
  }
}

export function validateJournal(lines: JournalLine[]): void {
  if (lines.length < 2) {
    throw new LedgerInvariantError("Journal must have at least two lines.");
  }

  let totalDebits = 0n;
  let totalCredits = 0n;

  for (const line of lines) {
    if (line.amount <= 0n) {
      throw new LedgerInvariantError(`Line amount must be > 0. Account: ${line.account}`);
    }

    if (line.type === 'DEBIT') {
      totalDebits += line.amount;
    } else {
      totalCredits += line.amount;
    }
  }

  if (totalDebits !== totalCredits) {
    throw new LedgerInvariantError(`Journal unbalanced: Debits (${totalDebits}) !== Credits (${totalCredits})`);
  }
}
