import { orderRegistry, Order } from './DataModel';
import { auditLog } from '../lean/docs/AuditTrail';
import { saveState } from './PersistenceService';

export class SystemCore {
  static processNewOrder(order: Order) {
    // 1. تحديث الذاكرة
    orderRegistry.push(order);
    
    // 2. التوثيق القانوني
    auditLog.push({
      transactionId: order.id,
      timestamp: new Date().toISOString(),
      retailerName: order.retailerName,
      factoryName: order.factoryName,
      agreementStatus: 'VERIFIED'
    });

    // 3. الحفظ الشامل (Persistence)
    saveState({
      orders: orderRegistry,
      audit: auditLog
    });

    console.log(`[SERVER] Transaction ${order.id} persisted successfully.`);
  }
}
