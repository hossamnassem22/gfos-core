export interface WorkOrder {
  orderId: string;
  deadline: Date;
  priority: number; // 1-10
}

export class ProductionScheduler {
  static schedule(orders: WorkOrder[]) {
    // خوارزمية ترتيب المهام بناءً على الموعد النهائي والأولوية
    return orders.sort((a, b) => a.priority - b.priority);
  }
}
