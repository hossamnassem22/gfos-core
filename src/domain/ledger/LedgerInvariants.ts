import { JournalLine } from "@core/ledger/types.ts";

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

  const seenIds = new Set<string>();
  let totalDebits = 0n;
  let totalCredits = 0n;

  for (const line of lines) {
    // منع المبالغ السالبة أو الصفرية
    if (line.amount <= 0n) {
      throw new LedgerInvariantError(`Line amount must be > 0. Account: ${line.account}`);
    }

    // منع الحسابات الفارغة
    if (!line.account || line.account.trim() === "") {
      throw new LedgerInvariantError("Line account code cannot be empty.");
    }

    // منع تكرار المعرفات
    if (line.id) {
      if (seenIds.has(line.id)) {
        throw new LedgerInvariantError(`Duplicate line ID: ${line.id}`);
      }
      seenIds.add(line.id);
    }

    if (line.type === 'DEBIT') totalDebits += line.amount;
    else if (line.type === 'CREDIT') totalCredits += line.amount;
  }

  // توازن القيد
  if (totalDebits !== totalCredits) {
    throw new LedgerInvariantError(`Journal unbalanced: Debits (${totalDebits}) !== Credits (${totalCredits})`);
  }
}
