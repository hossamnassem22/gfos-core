import express from 'express';
import { CommandContextManager } from '../context/CommandContext';
import { SaleService } from '../services/SaleService';
// سنفترض وجود instances جاهزة هنا
// import { eventStore, inventory, debt } from '../app'; 

const app = express();
app.use(express.json());

// الـ Middleware الخاص بنا للحقن التلقائي للـ Tenant
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(401).json({ error: "Missing Tenant ID" });

  CommandContextManager.run({ tenantId, requestId: 'req-' + Date.now() }, () => {
    next();
  });
});

// Endpoint البيع
app.post('/api/sales', async (req, res) => {
  try {
    const { productId, quantity, price, customerId, isCredit } = req.body;
    // const saleService = new SaleService(eventStore, inventory, debt);
    // const saleId = await saleService.recordSale({ productId, quantity, price }, customerId, isCredit);
    res.status(201).json({ status: "Success", saleId: "generated-id" });
  } catch (error) {
    res.status(500).json({ error: "Transaction Failed" });
  }
});

app.listen(3000, () => console.log('Commercial OS running on port 3000'));
