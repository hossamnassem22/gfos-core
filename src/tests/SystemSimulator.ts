import { InMemoryEventStore } from '../infrastructure/InMemoryEventStore';
import { InventoryProjection } from '../projections/InventoryProjection';
import { SaleService } from '../services/SaleService';
import { CommandContextManager } from '../context/CommandContext';

async function runSimulation() {
  const eventStore = new InMemoryEventStore();
  const inventory = new InventoryProjection();
  const saleService = new SaleService(eventStore, inventory);

  // التاجر A
  await CommandContextManager.run({ tenantId: 'tenant-A', requestId: 'req-1' }, async () => {
    await saleService.recordSale({ productId: 'iphone', quantity: 2, price: 1000 });
    console.log(`Tenant A - iPhone Stock: ${inventory.getStock('tenant-A', 'iphone')}`);
  });

  // التاجر B
  await CommandContextManager.run({ tenantId: 'tenant-B', requestId: 'req-2' }, async () => {
    await saleService.recordSale({ productId: 'iphone', quantity: 5, price: 1000 });
    console.log(`Tenant B - iPhone Stock: ${inventory.getStock('tenant-B', 'iphone')}`);
  });

  // التأكيد النهائي
  console.log('--- Verification ---');
  console.log(`Tenant A Final Stock: ${inventory.getStock('tenant-A', 'iphone')} (Expected: -2)`);
  console.log(`Tenant B Final Stock: ${inventory.getStock('tenant-B', 'iphone')} (Expected: -5)`);
}

runSimulation().catch(console.error);
