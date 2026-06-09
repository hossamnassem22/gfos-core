import { Account } from "./Account.ts";
export class AccountRepository {
  private accounts: Map<string, Account> = new Map();
  addAccount(account: Account) { this.accounts.set(account.code, account); }
  async getAccount(code: string) { return this.accounts.get(code); }
  async getAll(): Promise<Account[]> { return Array.from(this.accounts.values()); }
  async validateExistsAndActive(code: string) {
    const account = await this.getAccount(code);
    if (!account) throw new Error(`Unknown account: ${code}`);
    if (!account.isActive) throw new Error(`Inactive account: ${code}`);
  }
}
