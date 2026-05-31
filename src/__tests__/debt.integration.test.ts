import { transaction } from '../infrastructure/database/connection';
import { DebtService } from '../domain/debt/debt-service';
import { LedgerEngine } from '../domain/ledger/ledger-engine';
import { v4 as uuid } from 'uuid';

describe('Debt Financial Integrity Tests', () => {
  let tenantId: string;
  let userId: string;
  let arAccountId: string;
  let debtRevenueAccountId: string;
  let customerId: string;
  let fiscalPeriodId: string;

  beforeAll(async () => {
    // Setup test data
    tenantId = uuid();
    userId = uuid();
    customerId = uuid();
    arAccountId = uuid();
    debtRevenueAccountId = uuid();
    fiscalPeriodId = uuid();

    await transaction(async (client) => {
      // Create tenant
      await client.query(
        `INSERT INTO tenants (id, name, base_currency) VALUES ($1, $2, $3)`,
        [tenantId, 'Test Tenant', 'USD']
      );

      // Create user
      await client.query(
        `INSERT INTO users (id, tenant_id, email, password_hash) VALUES ($1, $2, $3, $4)`,
        [userId, tenantId, 'test@example.com', 'hash']
      );

      // Create accounts (CRITICAL: AR and Revenue accounts)
      // AR is ASSET type (debit increases)
      await client.query(
        `INSERT INTO accounts (id, tenant_id, code, name, type) VALUES ($1, $2, $3, $4, $5)`,
        [arAccountId, tenantId, '1100', 'Accounts Receivable', 'ASSET']
      );

      // Debt Revenue is INCOME type (credit increases)
      await client.query(
        `INSERT INTO accounts (id, tenant_id, code, name, type) VALUES ($1, $2, $3, $4, $5)`,
        [debtRevenueAccountId, tenantId, '4100', 'Debt Revenue', 'INCOME']
      );

      // Create fiscal period (OPEN for posting)
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      await client.query(
        `INSERT INTO fiscal_periods (id, tenant_id, period_name, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [fiscalPeriodId, tenantId, 'Current Month', startOfMonth, endOfMonth, 'OPEN']
      );

      // Create customer
      await client.query(
        `INSERT INTO customers (id, tenant_id, name, created_by) VALUES ($1, $2, $3, $4)`,
        [customerId, tenantId, 'Test Customer', userId]
      );
    });
  });

  test('✅ Create debt and verify it posts correctly to ledger', async () => {
    const principal = 100000n; // $1000.00 in cents

    const debtId = await transaction(async (client) => {
      return await DebtService.createDebt(client, {
        tenantId,
        customerId,
        principal,
        currency: 'USD',
        createdBy: userId,
      });
    });

    expect(debtId).toBeDefined();
    expect(typeof debtId).toBe('string');

    // Verify debt exists and is in ACTIVE status
    const debt = await transaction(async (client) => {
      return await DebtService.getDebt(client, debtId, tenantId);
    });

    expect(debt.principal).toBe(principal.toString());
    expect(debt.status).toBe('ACTIVE');
    expect(debt.posted_journal_entry_id).toBeDefined();
  });

  test('✅ CRITICAL: Verify ledger is balanced (debit = credit)', async () => {
    const balanced = await transaction(async (client) => {
      return await LedgerEngine.verifyLedgerBalance(client, tenantId);
    });

    // This is THE fundamental test - if this fails, the entire system is broken
    expect(balanced).toBe(true);
  });

  test('✅ Verify account balances are correct', async () => {
    // AR account should have a debit balance (asset increases with debit)
    const arBalance = await transaction(async (client) => {
      return await LedgerEngine.getAccountBalance(client, tenantId, arAccountId);
    });

    expect(arBalance).toBe(100000n);

    // Revenue account should have a credit balance (income increases with credit)
    // When we ask for the balance, it should be positive (stored as credit)
    const revenueBalance = await transaction(async (client) => {
      return await LedgerEngine.getAccountBalance(client, tenantId, debtRevenueAccountId);
    });

    expect(revenueBalance).toBe(100000n);
  });

  test('❌ Should reject debt with negative principal', async () => {
    try {
      await transaction(async (client) => {
        await DebtService.createDebt(client, {
          tenantId,
          customerId,
          principal: -100n,
          currency: 'USD',
          createdBy: userId,
        });
      });
      fail('Should have thrown error for negative principal');
    } catch (error: any) {
      expect(error.message).toContain('FINANCIAL_RULE_VIOLATION');
    }
  });

  test('❌ Should reject debt for non-existent customer', async () => {
    try {
      await transaction(async (client) => {
        await DebtService.createDebt(client, {
          tenantId,
          customerId: uuid(), // Non-existent
          principal: 100000n,
          currency: 'USD',
          createdBy: userId,
        });
      });
      fail('Should have thrown error for non-existent customer');
    } catch (error: any) {
      expect(error.message).toContain('CUSTOMER_NOT_FOUND');
    }
  });

  test('❌ Should reject debt with missing required accounts', async () => {
    // Try to create debt in a tenant without proper accounts
    const newTenantId = uuid();
    const newCustomerId = uuid();

    await transaction(async (client) => {
      // Create tenant
      await client.query(
        `INSERT INTO tenants (id, name, base_currency) VALUES ($1, $2, $3)`,
        [newTenantId, 'Test Tenant 2', 'USD']
      );

      // Create user
      await client.query(
        `INSERT INTO users (id, tenant_id, email, password_hash) VALUES ($1, $2, $3, $4)`,
        [userId, newTenantId, 'test2@example.com', 'hash']
      );

      // Create fiscal period
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      await client.query(
        `INSERT INTO fiscal_periods (id, tenant_id, period_name, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuid(), newTenantId, 'Current Month', startOfMonth, endOfMonth, 'OPEN']
      );

      // Create customer WITHOUT accounts
      await client.query(
        `INSERT INTO customers (id, tenant_id, name, created_by) VALUES ($1, $2, $3, $4)`,
        [newCustomerId, newTenantId, 'Test Customer 2', userId]
      );
    });

    try {
      await transaction(async (client) => {
        await DebtService.createDebt(client, {
          tenantId: newTenantId,
          customerId: newCustomerId,
          principal: 100000n,
          currency: 'USD',
          createdBy: userId,
        });
      });
      fail('Should have thrown error for missing accounts');
    } catch (error: any) {
      expect(error.message).toContain('REQUIRED_ACCOUNTS_NOT_FOUND');
    }
  });

  test('✅ Financial Integrity: Multiple debts maintain ledger balance', async () => {
    // Create multiple debts
    const amounts = [50000n, 75000n, 25000n]; // Multiple debts

    for (const amount of amounts) {
      await transaction(async (client) => {
        await DebtService.createDebt(client, {
          tenantId,
          customerId,
          principal: amount,
          currency: 'USD',
          createdBy: userId,
        });
      });
    }

    // Verify ledger is still balanced
    const balanced = await transaction(async (client) => {
      return await LedgerEngine.verifyLedgerBalance(client, tenantId);
    });

    expect(balanced).toBe(true);

    // Verify total balance is correct
    const totalAR = await transaction(async (client) => {
      return await LedgerEngine.getAccountBalance(client, tenantId, arAccountId);
    });

    const totalRevenue = await transaction(async (client) => {
      return await LedgerEngine.getAccountBalance(client, tenantId, debtRevenueAccountId);
    });

    // Total should be: initial 100000 + 50000 + 75000 + 25000 = 250000
    expect(totalAR).toBe(250000n);
    expect(totalRevenue).toBe(250000n);
  });
});
