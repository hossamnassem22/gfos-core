import express, { Express, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { transaction } from '../../infrastructure/database/connection';
import { DebtService } from '../../domain/debt/debt-service';
import { LedgerEngine } from '../../domain/ledger/ledger-engine';

const app: Express = express();
app.use(express.json());

// Middleware: Tenant validation
app.use((req: Request, res: Response, next) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }
  (req as any).tenantId = tenantId;
  next();
});

// Middleware: User simulation (in real system, from JWT)
app.use((req: Request, res: Response, next) => {
  (req as any).userId = req.headers['x-user-id'] as string || uuid();
  next();
});

/**
 * POST /debts
 * Create a new debt and post to ledger
 * Required headers: x-tenant-id, x-user-id (optional, auto-generated)
 */
app.post('/debts', async (req: Request, res: Response) => {
  try {
    const { customerId, principal, currency = 'USD', dueDate } = req.body;
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;

    // Validation
    if (!customerId || !principal) {
      return res.status(400).json({ error: 'Missing required fields: customerId, principal' });
    }

    if (principal <= 0) {
      return res.status(400).json({ error: 'Principal must be positive' });
    }

    // Convert to Money (BIGINT)
    const principalMoney = BigInt(principal);

    // Execute in transaction
    const debtId = await transaction(async (client) => {
      return await DebtService.createDebt(client, {
        tenantId,
        customerId,
        principal: principalMoney,
        currency,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdBy: userId,
      });
    });

    res.status(201).json({
      success: true,
      debtId,
      message: 'Debt created and posted to ledger',
    });
  } catch (error: any) {
    console.error('Error creating debt:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      code: error.message?.split(':')[0],
    });
  }
});

/**
 * GET /debts/:id
 * Retrieve debt details
 */
app.get('/debts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const debt = await transaction(async (client) => {
      return await DebtService.getDebt(client, id, tenantId);
    });

    res.json({
      success: true,
      debt,
    });
  } catch (error: any) {
    console.error('Error fetching debt:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /ledger/balance
 * Verify ledger is balanced (Debit = Credit)
 */
app.get('/ledger/balance', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;

    const balanced = await transaction(async (client) => {
      return await LedgerEngine.verifyLedgerBalance(client, tenantId);
    });

    res.json({
      success: true,
      balanced,
      message: balanced ? '✅ Ledger is perfectly balanced' : '❌ Ledger is IMBALANCED - CRITICAL',
    });
  } catch (error: any) {
    console.error('Error checking ledger balance:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { app };
