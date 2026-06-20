import type { IDatabasePort } from "../ports/database.port.ts";

export class IdempotencyGate {
  constructor(private db: IDatabasePort) {}

  async allow(key: string): Promise<boolean> {
    const existing = await this.db.query(
      "SELECT key FROM idempotency_keys WHERE key = ?",
      [key],
    );

    return existing.length === 0;
  }

  async register(key: string) {
    await this.db.execute(
      "INSERT INTO idempotency_keys (key) VALUES (?)",
      [key],
    );
  }
}
