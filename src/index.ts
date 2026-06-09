import { CommandContext } from "./context/CommandContext.ts";
import { InMemoryEventStore } from "./infrastructure/InMemoryEventStore.ts";
import { InventoryProjection } from "./projections/InventoryProjection.ts";
import { DebtProjection } from "./projections/DebtProjection.ts";
import { SaleService } from "./services/SaleService.ts";

async function main() {
  const eventStore = new InMemoryEventStore();
  const saleService = new SaleService(new InMemoryEventStore(), new InventoryProjection(), new DebtProjection());

  // تجربة تنفيذ أمر بيع
  await saleService.processSale({
    itemId: "product-123",
    quantity: 1,
    price: 500
  });
}

main();
