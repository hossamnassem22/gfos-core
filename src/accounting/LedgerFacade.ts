import { AccountStatement, LedgerEntry } from "./types.ts";

export class LedgerFacade {
  private entries: LedgerEntry[] = [];

  async postEntry(entry: LedgerEntry): Promise<void> {
    this.entries.push(entry);
    console.log(`[Ledger] Entry saved: ${entry.referenceId}`);
  }

  async getStatement(customerId: string): Promise<AccountStatement> {
    return {
      customerId,
      entries: this.entries.filter(e => e.customerId === customerId)
    };
  }
}
