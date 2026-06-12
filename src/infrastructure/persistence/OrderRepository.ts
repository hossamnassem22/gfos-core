import { sql } from "@infra/database/connection.ts";

export interface Order {
  merchantId: string;
  customerPhone: string;
  salesmanId?: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
}

export class OrderRepository {
  async create(order: Order): Promise<string> {
    return await sql.begin(async (tx) => {
      const [customer] = await tx`
        INSERT INTO customers (phone) 
        VALUES (${order.customerPhone}) 
        ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone 
        RETURNING id`;

      const [orderRow] = await tx`
        INSERT INTO orders (merchant_id, customer_id, total_amount, status, salesman_id)
        VALUES (${order.merchantId}, ${customer.id}, ${order.totalAmount}, 'CONFIRMED', ${order.salesmanId || null})
        RETURNING id`;

      for (const item of order.items) {
        await tx`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (${orderRow.id}, ${item.productId}, ${item.quantity}, ${item.price})`;
      }

      await tx`
        INSERT INTO ledger_entries (merchant_id, order_id, type, debit_account, credit_account, amount)
        VALUES (${order.merchantId}, ${orderRow.id}, 'SALE', 'CASH_RECEIVABLE', 'SALES_REVENUE', ${order.totalAmount})`;

      // محرك عمولات ديناميكي بالكامل
      if (order.salesmanId) {
        const [salesman] = await tx`
          SELECT commission_rate FROM salesmen WHERE id = ${order.salesmanId}
        `;
        
        if (salesman) {
          const commissionAmount = order.totalAmount * parseFloat(salesman.commission_rate);
          await tx`
            INSERT INTO ledger_entries (merchant_id, order_id, type, debit_account, credit_account, amount)
            VALUES (${order.merchantId}, ${orderRow.id}, 'COMMISSION', 'SALESMAN_PAYABLE', 'SALESMAN_COMMISSION', ${commissionAmount})`;
        }
      }

      return orderRow.id;
    });
  }
}
