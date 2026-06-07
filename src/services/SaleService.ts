import { EventFactory } from '../core/EventFactory';
import { SaleRecorded } from '../events/SaleEvents';
import { DebtIssued } from '../events/DebtEvents';
import { RecordSaleCommand } from '../commands/SaleCommands';
import { IEventStore } from '../infrastructure/EventStore';
import { InventoryProjection } from '../projections/InventoryProjection';
import { DebtProjection } from '../projections/DebtProjection';

export class SaleService {
  constructor(
    private eventStore: IEventStore,
    private inventory: InventoryProjection,
    private debt: DebtProjection
  ) {}

  async recordSale(command: RecordSaleCommand, customerId?: string, isCredit: boolean = false) {
    // 1. تسجيل البيع
    const saleEvent = EventFactory.create<SaleRecorded>({
      type: "SaleRecorded",
      productId: command.productId,
      quantity: command.quantity,
      price: command.price,
      version: 1
    });
    await this.eventStore.append(saleEvent);
    await this.inventory.handle(saleEvent);

    // 2. تسجيل الدين (إذا كان بيعاً بالأجل)
    if (isCredit && customerId) {
      const debtEvent = EventFactory.create<DebtIssued>({
        type: "DebtIssued",
        customerId,
        amount: command.price * command.quantity,
        version: 1
      });
      await this.eventStore.append(debtEvent);
      await this.debt.handle(debtEvent);
    }
    
    return saleEvent.eventId;
  }
}
