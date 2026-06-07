import { JournalEntry } from "../../application/services/TransactionEngine.ts";

export class LedgerInvariants {
  static verifyBalance(entry: JournalEntry): boolean {
    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0n);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0n);
    
    if (totalDebit !== totalCredit) {
      throw new Error(`[CRITICAL]: عدم توازن محاسبي في القيد ${entry.entryId}`);
    }
    return true;
  }
}
