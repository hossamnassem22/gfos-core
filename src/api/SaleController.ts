import { Request, Response } from 'express';
import { SaleService } from '../services/SaleService';
import { InMemoryEventStore } from '../infrastructure/InMemoryEventStore';
import { InventoryProjection } from '../projections/InventoryProjection';

// سينجلتون بسيط للتبسيط
const store = new InMemoryEventStore();
const inventory = new InventoryProjection();
const service = new SaleService(store, inventory);

export const recordSaleHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, price } = req.body;
    
    // الخدمة ستسحب الـ tenantId من الـ CommandContext الذي وضعه الـ Middleware
    const eventId = await service.recordSale({ productId, quantity, price });
    
    res.status(201).json({ success: true, eventId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
