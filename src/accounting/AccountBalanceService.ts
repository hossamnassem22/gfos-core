import { JournalRepository } from "./JournalRepository.ts";
import { AccountRepository } from "./AccountRepository.ts";

export class AccountBalanceService {
  constructor(private journalRepo: JournalRepository, private accountRepo: AccountRepository) {}

  async getBalance(accountCode: string) {
    const account = await this.accountRepo.getAccount(accountCode);
    if (!account) throw new Error("Account not found");

    const entries = await this.journalRepo.getEntriesByAccount(accountCode);
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      const line = entry.lines.find(l => l.accountCode === accountCode);
      if (line) {
        totalDebit += line.debit;
        totalCredit += line.credit;
      }
    }

    const balance = account.normalSide === 'DEBIT' 
      ? (totalDebit - totalCredit) 
      : (totalCredit - totalDebit);

    return { accountCode, totalDebit, totalCredit, balance };
  }
}
