import type { IDatabasePort } from "../ports/database.port.ts";

export class AccountStatement {
  constructor(private db: IDatabasePort) {}

  async getStatement(accountId: string) {
    const transactions = await this.db.query(
      "SELECT * FROM journal_entries WHERE account_id = ? ORDER BY created_at DESC",
      [accountId],
    );

    return {
      accountId,
      transactions,
    };
  }
}
