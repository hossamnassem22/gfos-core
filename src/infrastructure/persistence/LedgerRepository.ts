import { db } from "../database/connection.ts";

export class LedgerRepository {
  // unified database layer
  constructor(private readonly sql = db) {}

  async getLedger() {
    return await this.sql`SELECT * FROM ledger`;
  }
}
