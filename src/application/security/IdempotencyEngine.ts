import type { IDatabasePort } from "../ports/database.port.ts";

export class IdempotencyEngine {
  constructor(private db: IDatabasePort) {}

  async isDuplicate(key: string) {
    const rows = await this.db.query(
      "SELECT * FROM idempotency_keys WHERE key = ?",
      [key],
    );

    return rows.length > 0;
  }

  async saveKey(key: string) {
    await this.db.execute(
      "INSERT INTO idempotency_keys (key) VALUES (?)",
      [key],
    );
  }
}
