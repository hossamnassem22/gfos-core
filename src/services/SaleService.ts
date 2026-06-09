import { EventFactory } from "../core/EventFactory.ts";
import { CreateSaleCommand } from "../commands/SaleCommands.ts";
import { InventoryProjection } from "../projections/InventoryProjection.ts";
import { DebtProjection } from "../projections/DebtProjection.ts";

export class SaleService {
  constructor(
    private eventStore: any,
    private inventory: InventoryProjection,
    private debt: DebtProjection
  ) {}

  async processSale(command: CreateSaleCommand) {
    console.log("Processing sale for item:", command.itemId);
    
    // إنشاء حدث بناءً على الأمر
    const event = EventFactory.createEvent("SALE_CREATED", command);
    
    // حفظ الحدث في الـ Store
    await this.eventStore.save(event);
    
    console.log("Sale event persisted successfully.");
    return event;
  }
}
