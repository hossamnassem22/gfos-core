import { sql } from "@infra/database/connection.ts";
import { AmortizationScheduleRow } from "@core/financial-engine/amortization.ts";

export interface DebtRecord {
  id?: string;
  userId: string;
  customerId?: string;
  principalCents: bigint;
  currency: string;
  annualRateBps: number;
  termMonths: number;
  amortType: string;
  status: string;
}

export class DebtRepository {
  async save(debt: DebtRecord): Promise<string> {
    const rows = await sql`
      INSERT INTO debt_agreements
        (user_id, customer_id, principal_cents, currency, annual_rate_bps, term_months, amort_type, status)
      VALUES
        (${debt.userId}, ${debt.customerId ?? null}, ${debt.principalCents.toString()},
         ${debt.currency}, ${debt.annualRateBps}, ${debt.termMonths}, ${debt.amortType}, ${debt.status})
      RETURNING id
    `;
    return rows[0].id;
  }

  async saveSchedule(debtId: string, schedule: AmortizationScheduleRow[]): Promise<void> {
    for (const row of schedule) {
      await sql`
        INSERT INTO amortization_schedule
          (debt_id, installment_number, due_date, principal_cents,
           interest_cents, total_payment_cents, remaining_balance_cents)
        VALUES
          (${debtId}, ${row.installmentNumber}, ${row.dueDate.toISOString().split("T")[0]},
           ${row.principalCents.toString()}, ${row.interestCents.toString()},
           ${row.totalPaymentCents.toString()}, ${row.remainingBalanceCents.toString()})
      `;
    }
  }

  async findById(debtId: string): Promise<DebtRecord | null> {
    const rows = await sql`SELECT * FROM debt_agreements WHERE id = ${debtId}`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id:             r.id,
      userId:         r.user_id,
      customerId:     r.customer_id,
      principalCents: BigInt(r.principal_cents),
      currency:       r.currency,
      annualRateBps:  r.annual_rate_bps,
      termMonths:     r.term_months,
      amortType:      r.amort_type,
      status:         r.status,
    };
  }

  async findByUser(userId: string): Promise<DebtRecord[]> {
    const rows = await sql`
      SELECT * FROM debt_agreements WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
    return rows.map(r => ({
      id:             r.id,
      userId:         r.user_id,
      customerId:     r.customer_id,
      principalCents: BigInt(r.principal_cents),
      currency:       r.currency,
      annualRateBps:  r.annual_rate_bps,
      termMonths:     r.term_months,
      amortType:      r.amort_type,
      status:         r.status,
    }));
  }

  async findByCustomer(customerId: string): Promise<DebtRecord[]> {
    const rows = await sql`
      SELECT * FROM debt_agreements WHERE customer_id = ${customerId} ORDER BY created_at DESC
    `;
    return rows.map(r => ({
      id:             r.id,
      userId:         r.user_id,
      customerId:     r.customer_id,
      principalCents: BigInt(r.principal_cents),
      currency:       r.currency,
      annualRateBps:  r.annual_rate_bps,
      termMonths:     r.term_months,
      amortType:      r.amort_type,
      status:         r.status,
    }));
  }

  async getSchedule(debtId: string): Promise<AmortizationScheduleRow[]> {
    const rows = await sql`
      SELECT * FROM amortization_schedule WHERE debt_id = ${debtId} ORDER BY installment_number ASC
    `;
    return rows.map(r => ({
      installmentNumber:    r.installment_number,
      dueDate:              new Date(r.due_date),
      principalCents:       BigInt(r.principal_cents),
      interestCents:        BigInt(r.interest_cents),
      totalPaymentCents:    BigInt(r.total_payment_cents),
      remainingBalanceCents: BigInt(r.remaining_balance_cents),
    }));
  }
}
