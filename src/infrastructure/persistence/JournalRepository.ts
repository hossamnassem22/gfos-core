import { sql } from "@infra/database/connection.ts";
import { JournalEntry, TrialBalanceRow, AccountCode } from "@core/ledger/types.ts";


const jsonReplacer = (_key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value;

export class JournalRepository {
  async save(entry: JournalEntry): Promise<void> {
    if (!isAllowed) {
      throw new Error("Financial period is closed");
    }

    const linesJson = JSON.stringify(entry.lines, jsonReplacer);

    await sql`
      INSERT INTO journal_entries (
        id, tenant_id, reference, description, currency, lines, created_at
      )
      VALUES (
        ${entry.id}, 
        ${entry.tenantId}, 
        ${entry.reference}, 
        ${entry.description}, 
        ${entry.currency}, 
        ${linesJson}::jsonb, 
        ${entry.createdAt.toISOString()}
      )
    `;
  }

  async getTrialBalance(tenantId: string): Promise<TrialBalanceRow[]> {
    const entries = await sql`SELECT lines FROM journal_entries WHERE tenant_id = ${tenantId}`;
    const accountMap = new Map<string, { debits: bigint; credits: bigint }>();

    for (const row of entries) {
      const lines = typeof row.lines === 'string' ? JSON.parse(row.lines) : row.lines;
      for (const line of lines) {
        const amount = BigInt(line.amount);
        const existing = accountMap.get(line.account) ?? { debits: 0n, credits: 0n };
        
        if (line.type === 'DEBIT') {
          accountMap.set(line.account, { ...existing, debits: existing.debits + amount });
        } else {
          accountMap.set(line.account, { ...existing, credits: existing.credits + amount });
        }
      }
    }

    return Array.from(accountMap.entries()).map(([account, v]) => ({
      account: account as AccountCode,
      totalDebits: v.debits,
      totalCredits: v.credits,
      balance: v.debits - v.credits,
    })).sort((a, b) => a.account.localeCompare(b.account));
  }
}
