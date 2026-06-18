import { sql } from "../../infrastructure/database/connection.ts";

export interface PaymentRecord {
  debtId: string;
  amountCents: bigint;
  penaltiesPaid: bigint;
  interestPaid: bigint;
  principalPaid: bigint;
}

export class PaymentRepository {
  async save(payment: PaymentRecord): Promise<string> {
    const rows = await sql`
      INSERT INTO payments (debt_id, amount_cents, penalties_paid, interest_paid, principal_paid, paid_at)
      VALUES (${payment.debtId}, ${payment.amountCents.toString()}, 
              ${payment.penaltiesPaid.toString()}, ${payment.interestPaid.toString()}, 
              ${payment.principalPaid.toString()}, NOW())
      RETURNING id
    `;
    return rows[0].id;
  }

  async getPaymentsByDebt(debtId: string) {
    return await sql`SELECT * FROM payments WHERE debt_id = ${debtId} ORDER BY paid_at DESC`;
  }
}
