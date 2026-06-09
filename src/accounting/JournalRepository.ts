import { JournalEntry } from "./JournalEntry.ts";
import { AccountRepository } from "./AccountRepository.ts";

export class JournalRepository {
  private entries: JournalEntry[] = [];
  constructor(private accountRepo: AccountRepository) {}

  async save(entry: JournalEntry) {
    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
    if (totalDebit !== totalCredit) throw new Error("Journal entry is not balanced");
    for (const line of entry.lines) await this.accountRepo.validateExistsAndActive(line.accountCode);
    
    this.entries.push(entry);
    console.log("Journal Entry verified and persisted:", entry.referenceId);
  }

  async getEntriesByAccount(accountCode: string): Promise<JournalEntry[]> {
    return this.entries.filter(e => e.lines.some(l => l.accountCode === accountCode));
  }
}
