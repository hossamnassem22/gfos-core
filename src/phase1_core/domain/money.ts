export class Money {
  private readonly value: bigint;
  constructor(value: bigint) { if (value < 0n) throw new Error("NEGATIVE"); this.value = value; }
  static fromCents(cents: bigint): Money { return new Money(cents); }
  add(other: Money): Money { return new Money(this.value + other.value); }
  get raw(): bigint { return this.value; }
}
