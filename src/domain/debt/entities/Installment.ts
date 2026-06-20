import { Money } from '../../shared/Money.ts';

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WRITTEN_OFF';

export class Installment {
  constructor(
    public readonly id: string,
    public readonly debtId: string,
    public readonly dueDate: Date,
    public readonly amount: Money,
    public status: InstallmentStatus = 'PENDING'
  ) {}

  markAsPaid() {
    this.status = 'PAID';
  }
}
