import { LedgerEntry, EntryType } from "@domain/ledger/LedgerEntry.ts";
import { Money } from "@core/precision/value-objects.ts";
import { sql } from "@infra/database/connection.ts";

export class LedgerRepository {
  async save(entry: LedgerEntry): Promise<void> {
    await sql`
      INSERT INTO ledger_entries
        (user_id, account_id, amount_cents, currency, entry_type, created_at)
      VALUES
        (${entry.userId}, ${entry.accountId}, ${entry.amount.cents.toString()},
         ${entry.amount.currency}, ${entry.type}, ${entry.timestamp})
    `;
  }

  async findByUser(userId: string): Promise<LedgerEntry[]> {
    const rows = await sql`
      SELECT * FROM ledger_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return rows.map(row => new LedgerEntry(
      row.user_id,
      row.account_id,
      Money.fromCents(BigInt(row.amount_cents), row.currency),
      row.entry_type as EntryType,
      new Date(row.created_at),
    ));
  }

  async getBalance(userId: string, accountId: string): Promise<bigint> {
    const rows = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount_cents ELSE 0 END), 0) AS debits,
        COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount_cents ELSE 0 END), 0) AS credits
      FROM ledger_entries
      WHERE user_id = ${userId} AND account_id = ${accountId}
    `;

    const debits  = BigInt(rows[0].debits);
    const credits = BigInt(rows[0].credits);
    return debits - credits;
  }
}
