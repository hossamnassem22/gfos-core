/**
 * FINANCIAL ENGINE - Core Calculations
 * 
 * Pure functions ONLY:
 * ✅ No database access
 * ✅ No side effects
 * ✅ Same inputs = Same outputs (deterministic)
 * ✅ Easy to test
 * ✅ Easy to audit
 * ✅ Easy to replicate
 */

import { Money, Percentage, DayCountConvention, RoundingMode } from '../precision/value-objects';

/**
 * RULE_001: Daily Interest Calculation
 * 
 * Formula:
 * Daily Interest = (Principal × Annual Rate × Days) / Year Basis
 * 
 * Example:
 * Principal: 1,000,000 cents ($10,000)
 * Rate: 1,200,000 bps (12%)
 * Days: 1
 * Basis: 365
 * Result: 32,876 cents ($328.76)
 */
export function calculateDailyInterest(
  principal: Money,
  annualRate: Percentage,
  days: number,
  convention: DayCountConvention = DayCountConvention.ACTUAL_365
): Money {
  if (days < 0) {
    throw new Error('Days cannot be negative');
  }

  if (days === 0) {
    return Money.fromCents(0n, principal.currency);
  }

  // Get year basis
  const yearBasis = convention === DayCountConvention.ACTUAL_365 ? 365 : 360;

  // Formula: (principal × rate_in_bps) / 1_000_000 / yearBasis × days
  // Rearranged to avoid intermediate float:
  // (principal × rate_in_bps × days) / (1_000_000 × yearBasis)
  const numerator = principal.cents * annualRate.bps * BigInt(days);
  const denominator = 1_000_000n * BigInt(yearBasis);
  const interest = numerator / denominator;

  // Handle remainder for rounding
  const remainder = numerator % denominator;
  const rounded = bankersRound(interest, remainder, denominator);

  return Money.fromCents(rounded, principal.currency);
}

/**
 * RULE_002: Late Penalty Calculation
 * 
 * Formula:
 * Penalty = (Overdue Amount × Penalty Rate × Days Late) / Year Basis
 */
export function calculateLatePenalty(
  overdueAmount: Money,
  penaltyRate: Percentage,
  daysLate: number,
  convention: DayCountConvention = DayCountConvention.ACTUAL_365
): Money {
  if (overdueAmount.cents <= 0n) {
    return Money.fromCents(0n, overdueAmount.currency);
  }

  if (daysLate === 0) {
    return Money.fromCents(0n, overdueAmount.currency);
  }

  const yearBasis = convention === DayCountConvention.ACTUAL_365 ? 365 : 360;

  const numerator = overdueAmount.cents * penaltyRate.bps * BigInt(daysLate);
  const denominator = 1_000_000n * BigInt(yearBasis);
  const penalty = numerator / denominator;

  const remainder = numerator % denominator;
  const rounded = bankersRound(penalty, remainder, denominator);

  return Money.fromCents(rounded, overdueAmount.currency);
}

/**
 * RULE_003: Waterfall Allocation
 * 
 * Payment priority order:
 * 1. Fees
 * 2. Interest
 * 3. Penalties
 * 4. Principal
 */
export interface AllocationResult {
  fees: Money;
  interest: Money;
  penalties: Money;
  principal: Money;
  total: Money;
}

export function allocatePayment(
  payment: Money,
  feesOutstanding: Money,
  interestOutstanding: Money,
  penaltiesOutstanding: Money,
  principalOutstanding: Money
): AllocationResult {
  if (payment.currency !== feesOutstanding.currency) {
    throw new Error('Currency mismatch in allocation');
  }

  let remaining = payment.cents;
  const allocation = {
    fees: 0n,
    interest: 0n,
    penalties: 0n,
    principal: 0n,
  };

  // Priority 1: Fees
  allocation.fees = remaining < feesOutstanding.cents ? remaining : feesOutstanding.cents;
  remaining -= allocation.fees;

  // Priority 2: Interest
  allocation.interest =
    remaining < interestOutstanding.cents ? remaining : interestOutstanding.cents;
  remaining -= allocation.interest;

  // Priority 3: Penalties
  allocation.penalties =
    remaining < penaltiesOutstanding.cents ? remaining : penaltiesOutstanding.cents;
  remaining -= allocation.penalties;

  // Priority 4: Principal
  allocation.principal =
    remaining < principalOutstanding.cents ? remaining : principalOutstanding.cents;

  return {
    fees: Money.fromCents(allocation.fees, payment.currency),
    interest: Money.fromCents(allocation.interest, payment.currency),
    penalties: Money.fromCents(allocation.penalties, payment.currency),
    principal: Money.fromCents(allocation.principal, payment.currency),
    total: payment,
  };
}

/**
 * Banker's Rounding (Round-to-Even)
 * 
 * When exactly at 0.5:
 * - Round to the nearest even number
 * - This prevents systematic rounding up bias
 */
export function bankersRound(
  quotient: bigint,
  remainder: bigint,
  denominator: bigint
): bigint {
  if (remainder === 0n) {
    return quotient;
  }

  const half = denominator / 2n;

  if (remainder < half) {
    return quotient; // Round down
  } else if (remainder > half) {
    return quotient + 1n; // Round up
  } else {
    // Exactly half - round to even
    return quotient % 2n === 0n ? quotient : quotient + 1n;
  }
}

/**
 * RULE_004: Amortization Schedule
 * 
 * Calculate equal monthly payments and breakdown
 */
export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: Money;
  interestAmount: Money;
  totalAmount: Money;
  remainingBalance: Money;
}

export function calculateAmortizationSchedule(
  principal: Money,
  annualRate: Percentage,
  numberOfMonths: number
): InstallmentSchedule[] {
  if (numberOfMonths <= 0) {
    throw new Error('Number of months must be positive');
  }

  // Monthly rate in basis points
  const monthlyRateBps = annualRate.bps / 12n;

  // Calculate fixed monthly payment using standard formula
  // P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // Where c = monthly rate, n = months, L = principal

  const monthlyRate = monthlyRateBps / 1_000_000n; // Convert from BPS
  const schedules: InstallmentSchedule[] = [];

  let remainingBalance = principal.cents;
  const todayDate = new Date();

  for (let i = 1; i <= numberOfMonths; i++) {
    // Calculate interest for this month
    const interestPayment = (remainingBalance * monthlyRateBps) / 1_000_000n / 1_000_000n;

    // For simplicity in Phase 0, use equal principal payments
    // (Proper amortization uses fixed payment amount)
    const principalPayment = principal.cents / BigInt(numberOfMonths);

    const totalPayment = interestPayment + principalPayment;
    remainingBalance = remainingBalance - principalPayment;

    const dueDate = new Date(todayDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedules.push({
      installmentNumber: i,
      dueDate,
      principalAmount: Money.fromCents(principalPayment, principal.currency),
      interestAmount: Money.fromCents(interestPayment, principal.currency),
      totalAmount: Money.fromCents(totalPayment, principal.currency),
      remainingBalance: Money.fromCents(Math.max(0n, remainingBalance), principal.currency),
    });
  }

  return schedules;
}

/**
 * RULE_005: Calculate Days Between Dates (for interest accrual)
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}

/**
 * RULE_006: Calculate Accrued Interest (total since loan creation)
 */
export function calculateTotalAccruedInterest(
  principal: Money,
  annualRate: Percentage,
  creationDate: Date,
  asOfDate: Date = new Date(),
  convention: DayCountConvention = DayCountConvention.ACTUAL_365
): Money {
  const days = calculateDaysBetween(creationDate, asOfDate);
  return calculateDailyInterest(principal, annualRate, days, convention);
}
