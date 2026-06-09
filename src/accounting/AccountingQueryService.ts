import { JournalRepository } from "./JournalRepository.ts";

export class AccountingQueryService {
  constructor(private repo: JournalRepository) {}

  async getAccountStatement(accountCode: string) {
    const entries = await this.repo.getEntriesByAccount(accountCode);
    let runningBalance = 0;

    const statement = entries.map(entry => {
      const line = entry.lines.find(l => l.accountCode === accountCode)!;
      // الرصيد المتراكم: التغيير في الحساب بناءً على الحركة (مدين/دائن)
      runningBalance += (line.debit - line.credit);
      
      return {
        journalId: entry.referenceId,
        date: entry.timestamp,
        referenceType: entry.referenceType,
        debit: line.debit,
        credit: line.credit,
        runningBalance
      };
    });

    return { accountCode, statement };
  }
}
