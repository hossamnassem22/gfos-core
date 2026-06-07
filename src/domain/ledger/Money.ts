export class Money {
  constructor(
    public readonly cents: bigint,
    public readonly currency: string = "EGP"
  ) {}

  get currencyCode(): string {
    return this.currency;
  }

  static fromCents(cents: bigint, currency: string = "EGP"): Money {
    return new Money(cents, currency);
  }
}
