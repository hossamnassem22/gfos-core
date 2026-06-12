import { Money } from "@domain/ledger/Money.ts";

export class FinancialPolicyService {
  applyInterest(amount: Money, interest: bigint): Money {
    return new Money(amount.cents + interest, amount.currency);
  }

  applyPenalty(amount: Money, penalty: bigint): Money {
    return new Money(amount.cents + penalty, amount.currency);
  }
}
