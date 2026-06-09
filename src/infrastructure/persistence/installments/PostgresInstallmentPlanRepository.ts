import { InstallmentPlan } from "../../../collections/domain/InstallmentPlan.ts";
import { TransactionContext } from "../../../core/persistence/UnitOfWork.ts";

export class PostgresInstallmentPlanRepository {
  constructor(private db: any) {}

  async save(plan: InstallmentPlan, tx: TransactionContext): Promise<void> {
    // 1. حفظ الخطة الأساسية
    await tx.query(
      `INSERT INTO installment_plans (plan_id, customer_id, principal_amount, status)
       VALUES ($1, $2, $3, $4)`,
      [plan.planId, plan.customerId, plan.principalAmount, plan.status]
    );

    // 2. حفظ الأقساط المرتبطة (Batch Insert)
    for (const installment of plan.installments) {
      await tx.query(
        `INSERT INTO installments (installment_id, plan_id, due_date, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [installment.installmentId, plan.planId, installment.dueDate, installment.amount, installment.status]
      );
    }
  }
}
