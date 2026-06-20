import express from 'express';
import { commandMiddleware } from './middleware/CommandMiddleware.ts';
import { SaleService } from './services/SaleService.ts';
import { InMemoryEventStore } from './infrastructure/InMemoryEventStore.ts';
import { InventoryProjection } from './projections/InventoryProjection.ts';
import { DebtProjection } from './projections/DebtProjection.ts';

const app = express();
app.use(express.json());

// 1. Dependency Injection (Setup)
const eventStore = new InMemoryEventStore();
const inventory = new InventoryProjection();
const debt = new DebtProjection();
const saleService = new SaleService(eventStore, inventory, debt);

// 2. Security Boundary (The Middleware we built)
app.use(commandMiddleware);

// 3. API Route
app.post('/sales', async (req, res) => {
  try {
    const saleId = await saleService.recordSale(req.body);
    res.status(201).json({ message: 'Sale Recorded', saleId });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown Error' });
  }
});

app.listen(3000, () => console.log('Commercial OS is LIVE on port 3000'));
