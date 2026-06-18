import { sql } from "../../database/connection.ts";
import { JournalEntry, TrialBalanceRow, AccountCode } from "@core/ledger/types.ts";

const jsonReplacer = (_key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

export class JournalRepository {

  async save(entry: JournalEntry): Promise<void> {
    const linesJson = JSON.stringify(entry.lines, jsonReplacer);
    await sql`
      INSERT INTO journal_entries (id, tenant_id, reference, description, currency, lines, created_at)
      VALUES (
        ${entry.id}, ${entry.tenantId}, ${entry.reference},
        ${entry.description}, ${entry.currency},
        ${linesJson}::jsonb, ${entry.createdAt.toISOString()}
      )
    `;
  }

  async getTrialBalance(tenantId: string): Promise<TrialBalanceRow[]> {
    const entries = await sql`SELECT lines FROM journal_entries WHERE tenant_id = ${tenantId}`;
    const accountMap = new Map<string, { debits: bigint; credits: bigint }>();
    for (const row of entries) {
      const lines = typeof row.lines === 'string' ? JSON.parse(row.lines) : row.lines;
      for (const line of lines) {
        const existing = accountMap.get(line.account) ?? { debits: 0n, credits: 0n };
        const amount = BigInt(Math.round(Number(line.amount)));
        if (line.type === 'DEBIT') {
          accountMap.set(line.account, { ...existing, debits: existing.debits + amount });
        } else {
          accountMap.set(line.account, { ...existing, credits: existing.credits + amount });
        }
      }
    }
    return Array.from(accountMap.entries()).map(([account, v]) => ({
      account:      account as AccountCode,
      totalDebits:  v.debits,
      totalCredits: v.credits,
      balance:      v.debits - v.credits,
    })).sort((a, b) => a.account.localeCompare(b.account));
  }

  async findByTenant(tenantId: string, limit = 50): Promise<JournalEntry[]> {
    const rows = await sql`
      SELECT * FROM journal_entries
      WHERE tenant_id = ${tenantId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(r => ({
      id:          r.id,
      tenantId:    r.tenant_id,
      reference:   r.reference,
      description: r.description,
      currency:    r.currency,
      lines:       (typeof r.lines === 'string' ? JSON.parse(r.lines) : r.lines).map((l: any) => ({
        ...l, amount: BigInt(l.amount)
      })),
      createdAt:   new Date(r.created_at),
    }));
  }
}
