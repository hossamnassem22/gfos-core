import { AccountRepository } from "./AccountRepository.ts";
import { AccountBalanceService } from "./AccountBalanceService.ts";

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export class TrialBalanceService {
  constructor(private accounts: AccountRepository, private balances: AccountBalanceService) {}

  async generate() {
    const allAccounts = await this.accounts.getAll();
    const rows: TrialBalanceRow[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const acc of allAccounts) {
      const bal = await this.balances.getBalance(acc.code);
      // التصنيف: إذا كان الحساب مدين بطبيعته، يظهر الرصيد في جانب المدين
      const debit = acc.normalSide === 'DEBIT' ? bal.balance : 0;
      const credit = acc.normalSide === 'CREDIT' ? bal.balance : 0;
      
      rows.push({ accountCode: acc.code, accountName: acc.name, debit, credit });
      totalDebit += debit;
      totalCredit += credit;
    }

    return {
      rows,
      totalDebit,
      totalCredit,
      balanced: totalDebit === totalCredit
    };
  }
}
