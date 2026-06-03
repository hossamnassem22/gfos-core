export class Money {
  constructor(public readonly amount: bigint) {
    if (amount < 0n) throw new Error("DR-003: NEGATIVE_MONEY_NOT_ALLOWED");
  }
  static from(amount: number | bigint): Money {
    return new Money(BigInt(amount));
  }
  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }
}
