import { Money } from '../../shared/Money';
import { Installment } from '../entities/Installment';
import { randomUUID } from 'crypto';

export class Debt {
  public installments: Installment[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly principal: Money
  ) {}

  generateInstallments(count: number) {
    const installmentAmount = Money.from(this.principal.amount / BigInt(count));
    
    for (let i = 0; i < count; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1); // تاريخ استحقاق شهري
      
      this.installments.push(new Installment(
        randomUUID(),
        this.id,
        dueDate,
        installmentAmount
      ));
    }
  }
}
