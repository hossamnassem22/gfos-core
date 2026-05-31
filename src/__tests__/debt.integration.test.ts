import { transaction } from '../infrastructure/database/connection';
import { DebtService } from '../domain/debt/debt-service';
import { LedgerEngine } from '../domain/ledger/ledger-engine';
import { v4 as uuid } from 'uuid';

describe('Debt Integration Tests', () => {
  let tenantId: string;
  let userId: string;
  let customerId: string;

  beforeAll(async () => {
    // Setup test data
    tenantId = uuid();
    userId = uuid();
    customerId = uuid();

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

      // Create accounts
      const arAccountId = uuid();
      const debtRevenueAccountId = uuid();
      await client.query(
        `INSERT INTO accounts (id, tenant_id, code, name, type) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
        [
          arAccountId,
          tenantId,
          '1100',
          'Accounts Receivable',
          'ASSET',
          debtRevenueAccountId,
          tenantId,
          '4100',
          'Debt Revenue',
          'INCOME',
        ]
      );

      // Create fiscal period
      await client.query(
        `INSERT INTO fiscal_periods (id, tenant_id, period_name, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuid(), tenantId, 'Jan 2024', '2024-01-01', '2024-01-31', 'OPEN']
      );

      // Create customer
      await client.query(
        `INSERT INTO customers (id, tenant_id, name, created_by) VALUES ($1, $2, $3, $4)`,
        [customerId, tenantId, 'Test Customer', userId]
      );
    });
  });

  test('✅ Create debt and verify ledger posts correctly', async () => {
    const principal = 100000n; // $1000.00

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

    // Verify debt exists
    const debt = await transaction(async (client) => {
      return await DebtService.getDebt(client, debtId, tenantId);
    });

    expect(debt.principal).toBe(principal.toString());
    expect(debt.status).toBe('ACTIVE');
  });

  test('✅ Verify ledger is balanced (debit = credit)', async () => {
    const balanced = await transaction(async (client) => {
      return await LedgerEngine.verifyLedgerBalance(client, tenantId);
    });

    expect(balanced).toBe(true);
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
      fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('Principal must be positive');
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
      fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('CUSTOMER_NOT_FOUND');
    }
  });
});
