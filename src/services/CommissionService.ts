import { sql } from "../../infrastructu../../infrastructure/database/connection.ts";

export class CommissionService {
  async processCommission(orderId: string, salesmanId: string, amount: number) {
    // 1. جلب نسبة عمولة المندوب
    const [salesman] = await sql`SELECT commission_rate FROM salesmen WHERE id = ${salesmanId}`;
    const commissionAmount = amount * parseFloat(salesman.commission_rate);

    // 2. تسجيل العمولة في الـ Ledger
    await sql`
      INSERT INTO ledger_entries (order_id, type, debit_account, credit_account, amount)
      VALUES (${orderId}, 'COMMISSION', 'SALESMAN_PAYABLE', 'SALESMAN_COMMISSION', ${commissionAmount})
    `;
    
    return commissionAmount;
  }
}
