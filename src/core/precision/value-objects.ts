/**
 * Financial Precision Layer - Value Objects
 * 
 * These are the fundamental building blocks for all financial calculations.
 * No BigInt scattered throughout the codebase - only through these value objects.
 */

import { Decimal } from 'decimal.js';

/**
 * MONEY: The fundamental unit of financial calculations
 * 
 * Rules:
 * - ALWAYS BigInt (never float)
 * - Represents minor units (cents)
 * - immutable
 * - USD: 1 = 1 cent
 * - EUR/USD/GBP: 2 decimal places
 */
export class Money {
  private readonly value: bigint;
  private readonly currencyCode: string;

  constructor(cents: bigint, currency: string = 'USD') {
    if (typeof cents !== 'bigint') {
      throw new Error('Money must be BigInt. Use Money.fromCents() or Money.fromDollars()');
    }
    
    if (cents < 0n) {
      throw new Error('Money cannot be negative');
    }

    this.value = cents;
    this.currencyCode = currency;
  }

  /**
   * Create Money from cents (most common)
   * Example: Money.fromCents(100n) = $1.00
   */
  static fromCents(cents: bigint, currency: string = 'USD'): Money {
    return new Money(cents, currency);
  }

  /**
   * Create Money from dollars (for convenience only)
   * INTERNAL ONLY - converts to cents
   */
  static fromDollars(dollars: number, currency: string = 'USD'): Money {
    const cents = BigInt(Math.round(dollars * 100));
    return new Money(cents, currency);
  }

  /**
   * Create from string (safe parsing)
   */
  static fromString(value: string, currency: string = 'USD'): Money {
    try {
      const decimal = new Decimal(value);
      const cents = BigInt(decimal.times(100).toFixed(0));
      return new Money(cents, currency);
    } catch (e) {
      throw new Error(`Invalid money string: ${value}`);
    }
  }

  /**
   * Get the raw BigInt value (cents)
   */
  get cents(): bigint {
    return this.value;
  }

  /**
   * Get the currency code
   */
  get currency(): string {
    return this.currencyCode;
  }

  /**
   * Convert to dollars (for display only)
   */
  toDollars(): number {
    return Number(this.value) / 100;
  }

  /**
   * Convert to string "$1,234.56" format
   */
  toString(): string {
    const dollars = Math.floor(Number(this.value) / 100);
    const cents = Number(this.value) % 100;
    return `$${dollars.toLocaleString()}.${cents.toString().padStart(2, '0')}`;
  }

  /**
   * JSON representation
   */
  toJSON() {
    return {
      cents: this.value.toString(),
      dollars: this.toDollars(),
      currency: this.currencyCode,
      display: this.toString()
    };
  }
}

/**
 * PERCENTAGE: Annual interest rates, penalty rates, etc.
 * 
 * Rules:
 * - Stored as basis points (12% = 1_200_000)
 * - 1,000,000 = 1%
 * - No floats
 */
export class Percentage {
  private readonly basisPoints: bigint;

  constructor(basisPoints: bigint) {
    if (typeof basisPoints !== 'bigint') {
      throw new Error('Percentage must be BigInt basis points');
    }

    if (basisPoints < 0n) {
      throw new Error('Percentage cannot be negative');
    }

    this.basisPoints = basisPoints;
  }

  /**
   * Create from percentage (12.5% = Percentage.from(12.5))
   */
  static from(percentage: number): Percentage {
    const basisPoints = BigInt(Math.round(percentage * 1_000_000));
    return new Percentage(basisPoints);
  }

  /**
   * Create from decimal string ("0.12" = 12%)
   */
  static fromDecimal(decimal: string): Percentage {
    const basisPoints = BigInt(Math.round(parseFloat(decimal) * 100_000_000));
    return new Percentage(basisPoints);
  }

  /**
   * Get as basis points
   */
  get bps(): bigint {
    return this.basisPoints;
  }

  /**
   * Get as percentage (12.5)
   */
  getAsPercentage(): number {
    return Number(this.basisPoints) / 1_000_000;
  }

  /**
   * Get as decimal (0.125)
   */
  getAsDecimal(): bigint {
    return this.basisPoints / 1_000_000n;
  }

  toString(): string {
    return `${this.getAsPercentage()}%`;
  }
}

/**
 * CURRENCY: Metadata about a currency
 */
export interface Currency {
  code: string;        // 'USD', 'EUR', etc.
  decimalPlaces: number; // Usually 2, but JPY = 0
  symbol?: string;     // '$', '€', etc.
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', decimalPlaces: 2, symbol: '$' },
  EUR: { code: 'EUR', decimalPlaces: 2, symbol: '€' },
  GBP: { code: 'GBP', decimalPlaces: 2, symbol: '£' },
  JPY: { code: 'JPY', decimalPlaces: 0, symbol: '¥' },
  EGP: { code: 'EGP', decimalPlaces: 2, symbol: 'E£' },
  AED: { code: 'AED', decimalPlaces: 2, symbol: 'د.إ' },
  SAR: { code: 'SAR', decimalPlaces: 2, symbol: 'ر.س' },
};

/**
 * DAY COUNT CONVENTION: How to count days
 */
export enum DayCountConvention {
  ACTUAL_365 = 'ACTUAL_365',  // Actual days / 365
  ACTUAL_360 = 'ACTUAL_360',  // Actual days / 360
  THIRTY_360 = 'THIRTY_360',  // 30-day months / 360
}

/**
 * ROUNDING MODE: How to round
 */
export enum RoundingMode {
  BANKERS = 'BANKERS',      // Round to even (0.5 rounds to even)
  HALF_UP = 'HALF_UP',      // Traditional rounding (0.5 rounds up)
  HALF_DOWN = 'HALF_DOWN',  // 0.5 rounds down
  FLOOR = 'FLOOR',          // Always round down
  CEIL = 'CEIL',            // Always round up
}

/**
 * Exchange Rate
 */
export class ExchangeRate {
  private readonly rate: bigint; // In basis points
  private readonly fromCurrency: string;
  private readonly toCurrency: string;
  private readonly effectiveDate: Date;

  constructor(
    rate: bigint,
    from: string,
    to: string,
    effectiveDate: Date = new Date()
  ) {
    if (rate <= 0n) {
      throw new Error('Exchange rate must be positive');
    }

    this.rate = rate;
    this.fromCurrency = from;
    this.toCurrency = to;
    this.effectiveDate = effectiveDate;
  }

  /**
   * Create from decimal (1.25 = 1 USD = 1.25 EUR)
   */
  static fromDecimal(
    rate: number,
    from: string,
    to: string
  ): ExchangeRate {
    const rateBps = BigInt(Math.round(rate * 1_000_000));
    return new ExchangeRate(rateBps, from, to);
  }

  convert(amount: Money): Money {
    if (amount.currency !== this.fromCurrency) {
      throw new Error(
        `Currency mismatch: expected ${this.fromCurrency}, got ${amount.currency}`
      );
    }

    const converted = (amount.cents * this.rate) / 1_000_000n;
    return Money.fromCents(converted, this.toCurrency);
  }

  toString(): string {
    return `1 ${this.fromCurrency} = ${(Number(this.rate) / 1_000_000).toFixed(6)} ${this.toCurrency}`;
  }
}
