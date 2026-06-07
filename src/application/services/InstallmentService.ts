import { Money } from "../../domain/ledger/Money.ts";

export class InstallmentService {
  static calculateInstallment(totalAmount: Money, months: number): Money {
    const centsPerMonth = totalAmount.cents / BigInt(months);
    return new Money(centsPerMonth, totalAmount.currency);
  }
}
