import { AccountRepository } from "./AccountRepository.ts";
export function seedAccounts(repo: AccountRepository) {
  const accounts = [
    { code: 'CASH_ASSET', name: 'Cash', category: 'ASSET', normalSide: 'DEBIT', isActive: true },
    { code: 'INTEREST_INCOME', name: 'Interest', category: 'REVENUE', normalSide: 'CREDIT', isActive: true },
    { code: 'CUSTOMER_DEPOSITS', name: 'Customer Deposits', category: 'LIABILITY', normalSide: 'CREDIT', isActive: true }
  ];
  accounts.forEach(acc => repo.addAccount(acc as any));
}
