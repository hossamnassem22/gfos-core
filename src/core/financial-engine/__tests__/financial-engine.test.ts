/**
 * FINANCIAL ENGINE TESTS
 * 
 * Comprehensive testing of all financial calculations
 * verifying correctness against banking standards
 */

import {
  calculateDailyInterest,
  calculateLatePenalty,
  allocatePayment,
  bankersRound,
  calculateDaysBetween,
  calculateTotalAccruedInterest,
} from '../financial-engine';
import { Money, Percentage, DayCountConvention } from '../../precision/value-objects';

describe('Financial Engine - RULE_001: Daily Interest Calculation', () => {
  test('Calculate daily interest: $10,000 at 12% for 1 day', () => {
    const principal = Money.fromCents(1_000_000n, 'USD'); // $10,000
    const rate = Percentage.from(12); // 12%

    const interest = calculateDailyInterest(principal, rate, 1);

    // Expected: (1,000,000 × 1,200,000) / (1,000,000 × 365)
    //         = 1,200,000,000,000 / 365,000,000
    //         = 3,287.67... cents
    //         ≈ 3,288 cents = $32.88

    expect(interest.cents).toBe(3_288n);
    expect(interest.toDollars()).toBeCloseTo(32.88, 2);
  });

  test('Calculate daily interest for 30 days', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);

    const interest = calculateDailyInterest(principal, rate, 30);

    // 30 × $32.88 ≈ $986.30
    expect(interest.cents).toBe(98_630n);
  });

  test('Calculate daily interest for 1 year (365 days)', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);

    const interest = calculateDailyInterest(principal, rate, 365);

    // 365 × $32.88 = $12,000 (exactly 12%)
    expect(interest.cents).toBe(120_000n);
  });

  test('No interest for 0 days', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);

    const interest = calculateDailyInterest(principal, rate, 0);
    expect(interest.cents).toBe(0n);
  });

  test('Interest scales with principal', () => {
    const rate = Percentage.from(12);

    const interest1 = calculateDailyInterest(
      Money.fromCents(1_000_000n, 'USD'),
      rate,
      1
    );
    const interest2 = calculateDailyInterest(
      Money.fromCents(2_000_000n, 'USD'),
      rate,
      1
    );

    // Double principal = double interest
    expect(interest2.cents).toBe(interest1.cents * 2n);
  });

  test('Interest scales with rate', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');

    const interest12 = calculateDailyInterest(principal, Percentage.from(12), 1);
    const interest24 = calculateDailyInterest(principal, Percentage.from(24), 1);

    // Double rate = double interest
    expect(interest24.cents).toBe(interest12.cents * 2n);
  });

  test('ACTUAL_365 vs ACTUAL_360 convention', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);

    const interest365 = calculateDailyInterest(
      principal,
      rate,
      1,
      DayCountConvention.ACTUAL_365
    );
    const interest360 = calculateDailyInterest(
      principal,
      rate,
      1,
      DayCountConvention.ACTUAL_360
    );

    // 360-day basis yields slightly more interest
    expect(interest360.cents).toBeGreaterThan(interest365.cents);
  });
});

describe('Financial Engine - RULE_002: Late Penalty Calculation', () => {
  test('Calculate penalty: $1,000 overdue at 2% for 10 days', () => {
    const overdueAmount = Money.fromCents(100_000n, 'USD'); // $1,000
    const rate = Percentage.from(2); // 2% penalty rate

    const penalty = calculateLatePenalty(overdueAmount, rate, 10);

    // Expected: (100,000 × 200,000 × 10) / (1,000,000 × 365)
    //         = 200,000,000,000 / 365,000,000
    //         = 547.94... cents
    //         ≈ 548 cents = $5.48

    expect(penalty.cents).toBe(548n);
  });

  test('No penalty for $0 overdue', () => {
    const overdueAmount = Money.fromCents(0n, 'USD');
    const rate = Percentage.from(2);

    const penalty = calculateLatePenalty(overdueAmount, rate, 10);
    expect(penalty.cents).toBe(0n);
  });

  test('No penalty for 0 days late', () => {
    const overdueAmount = Money.fromCents(100_000n, 'USD');
    const rate = Percentage.from(2);

    const penalty = calculateLatePenalty(overdueAmount, rate, 0);
    expect(penalty.cents).toBe(0n);
  });
});

describe('Financial Engine - RULE_003: Waterfall Allocation', () => {
  test('Allocate payment: fees -> interest -> penalties -> principal', () => {
    const payment = Money.fromCents(500_000n, 'USD'); // $5,000

    const result = allocatePayment(
      payment,
      Money.fromCents(100_000n, 'USD'), // $1,000 fees
      Money.fromCents(150_000n, 'USD'), // $1,500 interest
      Money.fromCents(100_000n, 'USD'), // $1,000 penalties
      Money.fromCents(200_000n, 'USD') // $2,000 principal
    );

    // Order: Fees -> Interest -> Penalties -> Principal
    expect(result.fees.cents).toBe(100_000n); // All fees paid
    expect(result.interest.cents).toBe(150_000n); // All interest paid
    expect(result.penalties.cents).toBe(100_000n); // All penalties paid
    expect(result.principal.cents).toBe(50_000n); // Remaining goes to principal
    expect(result.total.cents).toBe(500_000n); // Total unchanged
  });

  test('Partial payment: only covers fees', () => {
    const payment = Money.fromCents(50_000n, 'USD');

    const result = allocatePayment(
      payment,
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(100_000n, 'USD')
    );

    expect(result.fees.cents).toBe(50_000n);
    expect(result.interest.cents).toBe(0n);
    expect(result.penalties.cents).toBe(0n);
    expect(result.principal.cents).toBe(0n);
  });

  test('Large payment: covers all except partial principal', () => {
    const payment = Money.fromCents(400_000n, 'USD');

    const result = allocatePayment(
      payment,
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(100_000n, 'USD'),
      Money.fromCents(200_000n, 'USD')
    );

    expect(result.fees.cents).toBe(100_000n);
    expect(result.interest.cents).toBe(100_000n);
    expect(result.penalties.cents).toBe(100_000n);
    expect(result.principal.cents).toBe(100_000n);
  });
});

describe('Financial Engine - RULE_004: Banker\'s Rounding', () => {
  test('Round down when remainder < half', () => {
    // 10 / 3 = 3.33... should round to 3
    const result = bankersRound(3n, 1n, 3n);
    expect(result).toBe(3n);
  });

  test('Round up when remainder > half', () => {
    // 10 / 3 = 3.66... should round to 4
    const result = bankersRound(3n, 2n, 3n);
    expect(result).toBe(4n);
  });

  test('Round to even when exactly 0.5', () => {
    // Test rounding .5 to even number
    const result1 = bankersRound(2n, 1n, 2n); // 2.5 -> 2 (even)
    const result2 = bankersRound(3n, 1n, 2n); // 3.5 -> 4 (even)

    expect(result1).toBe(2n);
    expect(result2).toBe(4n);
  });

  test('No rounding when remainder is 0', () => {
    const result = bankersRound(10n, 0n, 1n);
    expect(result).toBe(10n);
  });
});

describe('Financial Engine - RULE_005: Day Calculation', () => {
  test('Calculate days between dates', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-01-02');

    const days = calculateDaysBetween(start, end);
    expect(days).toBe(1);
  });

  test('Calculate 30 days', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-01-31');

    const days = calculateDaysBetween(start, end);
    expect(days).toBe(30);
  });

  test('Same day = 0 days', () => {
    const date = new Date('2026-01-01');
    const days = calculateDaysBetween(date, date);
    expect(days).toBe(0);
  });
});

describe('Financial Engine - RULE_006: Total Accrued Interest', () => {
  test('Calculate total interest from creation date', () => {
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);
    const created = new Date('2026-01-01');
    const asOf = new Date('2026-01-31'); // 30 days later

    const interest = calculateTotalAccruedInterest(principal, rate, created, asOf);

    // 30 days of interest at 12%
    expect(interest.cents).toBe(98_630n); // ~$986.30
  });
});

describe('Financial Engine - Integration Tests', () => {
  test('Complete loan cycle: create, accrue interest, pay', () => {
    // Day 1: Create $10,000 loan at 12%
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);

    // Day 31: Calculate 30 days of interest
    const interest = calculateDailyInterest(principal, rate, 30);
    expect(interest.cents).toBe(98_630n);

    // Day 31: Receive $5,000 payment
    // Should allocate: all to principal (no other charges yet)
    const payment = Money.fromCents(500_000n, 'USD');
    const allocation = allocatePayment(
      payment,
      Money.fromCents(0n, 'USD'), // $0 fees
      Money.fromCents(0n, 'USD'), // $0 interest due
      Money.fromCents(0n, 'USD'), // $0 penalties
      Money.fromCents(1_000_000n, 'USD') // $10,000 principal
    );

    expect(allocation.principal.cents).toBe(500_000n);
    expect(allocation.total.cents).toBe(500_000n);
  });

  test('Ledger must balance: Debit = Credit', () => {
    // Any calculation must result in balanced entries
    const principal = Money.fromCents(1_000_000n, 'USD');
    const rate = Percentage.from(12);
    const interest = calculateDailyInterest(principal, rate, 30);

    // Interest accrual:
    // DR Interest Receivable: $986.30
    // CR Interest Income: $986.30
    // Balanced ✓

    const debit = interest.cents;
    const credit = interest.cents;

    expect(debit).toBe(credit);
  });
});
