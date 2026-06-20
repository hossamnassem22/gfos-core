import { PoolClient } from 'pg';
import { v4 as uuid } from 'uuid';
import { Money, TenantId, UserId, EntryStatus, DebtId, JournalEntryId } from '../../shared/types.ts';

export interface JournalLine {
  accountId: string;
  debitAmount: Money;
  creditAmount: Money;
  currency: string;
  description?: string;
}

export interface JournalEntryData {
  tenantId: TenantId;
  description: string;
  postingDate: Date;
  lines: JournalLine[];
  createdBy: UserId;
}

export class LedgerEngine {
  /**
   * CORE RULE: Debit = Credit ALWAYS
   * This is the heartbeat of the financial system
   */
  static validateDoubleEntry(lines: JournalLine[]): boolean {
    let totalDebit = 0n;
    let totalCredit = 0n;

    for (const line of lines) {
      totalDebit += line.debitAmount;
      totalCredit += line.creditAmount;
    }

    return totalDebit === totalCredit && totalDebit > 0n;
  }

  /**
   * POST Journal Entry to Ledger
   * This is the ONLY way to affect financial truth
   * IMMUTABLE: Once posted, cannot be modified. Can only be reversed.
   */
  static async postJournalEntry(
    client: PoolClient,
    data: JournalEntryData
  ): Promise<JournalEntryId> {
    // Rule 1: Validate double entry
    if (!this.validateDoubleEntry(data.lines)) {
      throw new Error('FINANCIAL_RULE_VIOLATION: Debits must equal credits');
    }

    // Rule 2: Validate posting date is in open period
    const periodCheck = await client.query(
      `SELECT id FROM fiscal_periods 
       WHERE tenant_id = $1 AND start_date <= $2 AND end_date >= $2 AND status = 'OPEN'`,
      [data.tenantId, data.postingDate]
    );

    if (periodCheck.rows.length === 0) {
      throw new Error('FINANCIAL_RULE_VIOLATION: Cannot post to closed period');
    }

    // Rule 3: Get next entry number (sequential, immutable)
    const entryNumResult = await client.query(
      `SELECT COALESCE(MAX(entry_number), 0) + 1 as next_num FROM journal_entries WHERE tenant_id = $1`,
      [data.tenantId]
    );
    const entryNumber = entryNumResult.rows[0].next_num;

    // Rule 4: Insert journal entry in DRAFT status
    const entryId = uuid();
    await client.query(
      `INSERT INTO journal_entries (id, tenant_id, entry_number, description, posting_date, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [entryId, data.tenantId, entryNumber, data.description, data.postingDate, EntryStatus.DRAFT, data.createdBy, new Date()]
    );

    // Rule 5: Insert journal lines (immutable)
    for (const line of data.lines) {
      const lineId = uuid();
      await client.query(
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, currency, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [lineId, entryId, line.accountId, line.debitAmount, line.creditAmount, line.currency, line.description]
      );
    }

    // Rule 6: Move to POSTED status
    await client.query(
      `UPDATE journal_entries SET status = $1, posted_at = $2, posted_by = $3 WHERE id = $4`,
      [EntryStatus.POSTED, new Date(), data.createdBy, entryId]
    );

    return entryId as JournalEntryId;
  }

  /**
   * VERIFY Ledger Balance (Query-only, read from POSTED entries)
   * This proves Debit = Credit across entire ledger
   */
  static async verifyLedgerBalance(client: PoolClient, tenantId: TenantId): Promise<boolean> {
    const result = await client.query(
      `SELECT 
        SUM(debit_amount) as total_debits,
        SUM(credit_amount) as total_credits
       FROM journal_lines jl
       JOIN journal_entries je ON jl.journal_entry_id = je.id
       WHERE je.tenant_id = $1 AND je.status = $2`,
      [tenantId, EntryStatus.POSTED]
    );

    const { total_debits, total_credits } = result.rows[0];
    const balanced = total_debits === total_credits;

    if (!balanced) {
      console.warn(`⚠️ LEDGER IMBALANCE DETECTED for tenant ${tenantId}`);
      console.warn(`   Debits: ${total_debits}, Credits: ${total_credits}`);
    }

    return balanced;
  }

  /**
   * GET Account Balance (Derived from Ledger, not stored)
   * This is read-only, calculated from posted entries
   */
  static async getAccountBalance(
    client: PoolClient,
    tenantId: TenantId,
    accountId: string,
    asOfDate?: Date
  ): Promise<Money> {
    const query = asOfDate
      ? `SELECT 
          COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) as balance
         FROM journal_lines jl
         JOIN journal_entries je ON jl.journal_entry_id = je.id
         WHERE je.tenant_id = $1 AND jl.account_id = $2 AND je.status = $3 AND je.posting_date <= $4`
      : `SELECT 
          COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) as balance
         FROM journal_lines jl
         JOIN journal_entries je ON jl.journal_entry_id = je.id
         WHERE je.tenant_id = $1 AND jl.account_id = $2 AND je.status = $3`;

    const params = asOfDate
      ? [tenantId, accountId, EntryStatus.POSTED, asOfDate]
      : [tenantId, accountId, EntryStatus.POSTED];

    const result = await client.query(query, params);
    return BigInt(result.rows[0].balance || 0);
  }
}
