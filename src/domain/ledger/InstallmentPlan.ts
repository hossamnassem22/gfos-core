import { Money } from "./Money.ts";

export class InstallmentPlan {
  constructor(
    public readonly totalAmount: Money,
    public readonly installments: number,
    public readonly interestRate: number
  ) {}

  calculateMonthlyPayment(): Money {
    const totalWithInterest = this.totalAmount.cents + (this.totalAmount.cents * BigInt(this.interestRate) / 100n);
    return new Money(totalWithInterest / BigInt(this.installments), this.totalAmount.currency);
  }
}
