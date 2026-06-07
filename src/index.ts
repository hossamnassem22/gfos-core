import express from 'express';
import { CommandContextManager } from './context/CommandContext';
import { InMemoryEventStore } from './infrastructure/InMemoryEventStore';
import { InventoryProjection } from './projections/InventoryProjection';
import { DebtProjection } from './projections/DebtProjection';
import { SaleService } from './services/SaleService';

// 1. تهيئة النظام (Dependency Injection)
const eventStore = new InMemoryEventStore();
const inventory = new InventoryProjection();
const debt = new DebtProjection();
const saleService = new SaleService(eventStore, inventory, debt);

const app = express();
app.use(express.json());

// 2. حارس البوابة (Security Middleware)
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(401).json({ error: "TENANT_ID_REQUIRED" });
  CommandContextManager.run({ tenantId, requestId: 'req-' + Date.now() }, () => next());
});

// 3. مسار البيع (The Sales Pipeline)
app.post('/api/sales', async (req, res) => {
  const { productId, quantity, price, customerId, isCredit } = req.body;
  try {
    const saleId = await saleService.recordSale({ productId, quantity, price }, customerId, isCredit);
    res.status(201).json({ status: "Success", saleId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Commercial OS is LIVE on port 3000 🚀'));
