import { Money } from '../../domain/shared/Money';
import { Installment } from '../../domain/debt/entities/Installment';

export class AllocationService {
  allocate(amount: Money, pendingInstallments: Installment[]): { installmentId: string, amount: Money }[] {
    let remainingAmount = amount.amount;
    const allocations = [];

    for (const inst of pendingInstallments) {
      if (remainingAmount <= 0n) break;

      const instAmount = inst.amount.amount;
      const paymentForThis = remainingAmount >= instAmount ? instAmount : remainingAmount;

      allocations.push({
        installmentId: inst.id,
        amount: Money.from(paymentForThis)
      });

      remainingAmount -= paymentForThis;
      inst.markAsPaid(); // تحديث الحالة
    }

    return allocations;
  }
}
