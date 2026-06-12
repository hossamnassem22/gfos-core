import { Decimal } from "npm:decimal.js";

export class Money {
  private constructor(
    public readonly cents: bigint,
    private readonly _currency: string
  ) {}

  get currency(): string {
    return this._currency;
  }

  static fromCents(cents: bigint, currency: string): Money {
    return new Money(cents, currency);
  }

  static fromDecimal(amount: Decimal, currency: string): Money {
    const cents = BigInt(amount.times(100).toFixed(0));
    return new Money(cents, currency);
  }

  add(other: Money): Money {
    if (other._currency !== this._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
    return new Money(this.cents + other.cents, this._currency);
  }

  subtract(other: Money): Money {
    if (other._currency !== this._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
    return new Money(this.cents - other.cents, this._currency);
  }

  toDecimal(): Decimal {
    return new Decimal(this.cents.toString()).div(100);
  }

  toString(): string {
    return `${this.toDecimal().toFixed(2)} ${this._currency}`;
  }
}
