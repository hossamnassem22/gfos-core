import { PoolClient } from 'pg';
import { v4 as uuid } from 'uuid';
import { Money, TenantId, UserId, DebtId } from '../../shared/types';
import { LedgerEngine, JournalEntryData } from '../ledger/ledger-engine';

export interface CreateDebtRequest {
  tenantId: TenantId;
  customerId: string;
  principal: Money;
  currency: string;
  dueDate?: Date;
  createdBy: UserId;
}

export class DebtService {
  /**
   * Create Debt and post to Ledger
   * FLOW:
   * 1. Validate customer exists
   * 2. Create debt record
   * 3. POST Journal Entry (Debit: Customer A/R, Credit: Debt Revenue)
   * 4. Link journal entry to debt
   * 5. Record event
   */
  static async createDebt(client: PoolClient, request: CreateDebtRequest): Promise<DebtId> {
    // Step 1: Validate customer
    const customerCheck = await client.query(
      `SELECT id FROM customers WHERE id = $1 AND tenant_id = $2`,
      [request.customerId, request.tenantId]
    );

    if (customerCheck.rows.length === 0) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    // Step 2: Get AR and Debt Revenue accounts (must exist)
    const accountsCheck = await client.query(
      `SELECT id, type FROM accounts WHERE tenant_id = $1 AND code IN ('1100', '4100')`,
      [request.tenantId]
    );

    if (accountsCheck.rows.length < 2) {
      throw new Error('REQUIRED_ACCOUNTS_NOT_FOUND: Need AR (1100) and Debt Revenue (4100) accounts');
    }

    const accounts = Object.fromEntries(accountsCheck.rows.map((r) => [r.code, r.id]));
    const arAccountId = accounts['1100'];
    const debtRevenueAccountId = accounts['4100'];

    // Step 3: Create debt record
    const debtId = uuid() as DebtId;
    const now = new Date();

    await client.query(
      `INSERT INTO debts (id, tenant_id, customer_id, principal, currency, status, originated_date, due_date, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [debtId, request.tenantId, request.customerId, request.principal, request.currency, 'ACTIVE', now, request.dueDate, request.createdBy, now]
    );

    // Step 4: Post to Ledger
    const journalData: JournalEntryData = {
      tenantId: request.tenantId,
      description: `Debt created for customer ${request.customerId}`,
      postingDate: now,
      createdBy: request.createdBy,
      lines: [
        {
          accountId: arAccountId,
          debitAmount: request.principal, // Debit AR
          creditAmount: 0n,
          currency: request.currency,
          description: `Customer A/R - Debt ${debtId}`,
        },
        {
          accountId: debtRevenueAccountId,
          debitAmount: 0n,
          creditAmount: request.principal, // Credit Revenue
          currency: request.currency,
          description: `Debt Revenue - Debt ${debtId}`,
        },
      ],
    };

    const journalEntryId = await LedgerEngine.postJournalEntry(client, journalData);

    // Step 5: Link journal entry to debt
    await client.query(
      `UPDATE debts SET posted_journal_entry_id = $1 WHERE id = $2`,
      [journalEntryId, debtId]
    );

    // Step 6: Record event
    await client.query(
      `INSERT INTO event_store (tenant_id, event_type, aggregate_id, payload, idempotency_key, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        request.tenantId,
        'DEBT_CREATED',
        debtId,
        JSON.stringify({
          debtId,
          customerId: request.customerId,
          principal: request.principal.toString(),
          journalEntryId,
        }),
        `debt-${debtId}-${now.getTime()}`,
        now,
      ]
    );

    return debtId;
  }

  /**
   * Get Debt with current ledger balance
   */
  static async getDebt(client: PoolClient, debtId: DebtId, tenantId: TenantId) {
    const result = await client.query(
      `SELECT d.*, c.name as customer_name, je.entry_number as journal_entry_number
       FROM debts d
       JOIN customers c ON d.customer_id = c.id
       LEFT JOIN journal_entries je ON d.posted_journal_entry_id = je.id
       WHERE d.id = $1 AND d.tenant_id = $2`,
      [debtId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new Error('DEBT_NOT_FOUND');
    }

    return result.rows[0];
  }
}
