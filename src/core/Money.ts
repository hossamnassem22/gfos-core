// src/core/Money.ts
// ═══════════════════════════════════════════════════════════════
// CANONICAL MONEY — المصدر الوحيد للحقيقة المالية في النظام
// الوحدة: millimes (1 جنيه = 1000 millime)
// السبب: annualRateBps / 12 يحتاج 3 خانات عشرية على الأقل
// القاعدة: لا float أبداً في أي عملية مالية
// ═══════════════════════════════════════════════════════════════

export type Currency = "EGP";

export class Money {
  private constructor(
    public readonly millimes: bigint,
    public readonly currency: Currency,
  ) {
    if (millimes < 0n) {
      throw new MoneyError(`Money cannot be negative: ${millimes}`);
    }
  }

  // ── Constructors ──────────────────────────────────────────────

  static fromMillimes(millimes: bigint, currency: Currency = "EGP"): Money {
    return new Money(millimes, currency);
  }

  // من جنيهات كـ string (e.g. "1500.50") — تجنب float errors
  static fromPounds(pounds: string, currency: Currency = "EGP"): Money {
    const clean = pounds.trim().replace(/,/g, "");
    const [intPart, fracPart = ""] = clean.split(".");
    const frac = fracPart.padEnd(3, "0").slice(0, 3);
    const millimes = BigInt(intPart) * 1000n + BigInt(frac);
    return new Money(millimes, currency);
  }

  // من cents (للتوافق مع البيانات القديمة في DB: amount_cents)
  static fromCents(cents: bigint, currency: Currency = "EGP"): Money {
    return new Money(cents * 10n, currency);
  }

  static zero(currency: Currency = "EGP"): Money {
    return new Money(0n, currency);
  }

  static sum(amounts: Money[], currency: Currency = "EGP"): Money {
    return amounts.reduce((acc, m) => acc.add(m), Money.zero(currency));
  }

  // ── Arithmetic ────────────────────────────────────────────────

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.millimes + other.millimes, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (other.millimes > this.millimes) {
      throw new MoneyError(
        `Subtraction underflow: ${this.millimes} - ${other.millimes}`,
      );
    }
    return new Money(this.millimes - other.millimes, this.currency);
  }

  // ضرب في basis points: result = millimes × bps / 10000
  // 1% = 100 bps, 24% سنوي = 2400 bps
  multiplyByBps(bps: number): Money {
    if (bps < 0) throw new MoneyError("BPS cannot be negative");
    const result = (this.millimes * BigInt(bps)) / 10000n;
    return new Money(result, this.currency);
  }

  // قسمة مع إرجاع الباقي (للقسط الأخير)
  divideBy(n: number): { quotient: Money; remainder: Money } {
    if (n <= 0) throw new MoneyError("Divisor must be > 0");
    const q = this.millimes / BigInt(n);
    const rem = this.millimes - q * BigInt(n);
    return {
      quotient: new Money(q, this.currency),
      remainder: new Money(rem, this.currency),
    };
  }

  // ── Comparison ────────────────────────────────────────────────

  equals(other: Money): boolean {
    return this.millimes === other.millimes && this.currency === other.currency;
  }
  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.millimes > other.millimes;
  }
  greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.millimes >= other.millimes;
  }
  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.millimes < other.millimes;
  }
  isZero(): boolean {
    return this.millimes === 0n;
  }

  // ── Output ────────────────────────────────────────────────────

  // للعرض: "1500.500 EGP"
  toPounds(): string {
    const whole = this.millimes / 1000n;
    const frac = (this.millimes % 1000n).toString().padStart(3, "0");
    return `${whole}.${frac}`;
  }

  // للـ API: رقم عشري
  toNumber(): number {
    return Number(this.millimes) / 1000;
  }

  // للـ DB: نخزن millimes كـ bigint
  toDb(): bigint {
    return this.millimes;
  }

  toString(): string {
    return `${this.toPounds()} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new MoneyError(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}
