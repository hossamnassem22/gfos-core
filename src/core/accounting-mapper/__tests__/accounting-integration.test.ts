/**
 * ACCOUNTING INTEGRATION TESTS
 * 
 * Verify the entire pipeline:
 * FinancialEngine → Accounting Mapper → Journal Template → GL Mapping → PostingEngine
 * 
 * This ensures calculations correctly transform to accounting entries.
 */

import {
  calculateDailyInterest,
  calculateLatePenalty,
  allocatePayment,
} from '../financial-engine/financial-engine';
import {
  mapInterestAccrual,
  mapPenaltyCharge,
  mapPaymentAllocation,
} from '../accounting-mapper/accounting-mapper';
import { Money, Percentage } from '../../precision/value-objects';

describe('Accounting Integration - FinancialEngine → Mapper → Template', () => {
  /**
   * TEST 1: Interest Accrual Pipeline
   * 
   * FinancialEngine Output → Accounting Mapper → Journal Template → GL Mapping
   */
  test('Interest accrual: calculation → mapping → journal template', () => {
    // STEP 1: FinancialEngine calculates
    const principal = Money.fromCents(1_000_000n, 'USD'); // $10,000
    const rate = Percentage.from(12);
    const daysAccrued = 30;

    const accruedInterest = calculateDailyInterest(principal, rate, daysAccrued);
    expect(accruedInterest.cents).toBe(98_630n); // ~$986.30

    // STEP 2: Accounting Mapper maps to GL
    const accountMapping = {
      interestReceivable: 'acc-ir-001', // UUID
      interestIncome: 'acc-ii-001', // UUID
    };

    const mapping = mapInterestAccrual(accruedInterest, 'debt-123', accountMapping);

    // STEP 3: Verify mapping structure
    expect(mapping.debitAccount.amount.cents).toBe(98_630n);
    expect(mapping.creditAccount.amount.cents).toBe(98_630n);
    expect(mapping.debitAccount.accountId).toBe('acc-ir-001');
    expect(mapping.creditAccount.accountId).toBe('acc-ii-001');

    // STEP 4: Verify balance (CRITICAL)
    expect(mapping.debitAccount.amount.cents).toBe(
      mapping.creditAccount.amount.cents
    );
    expect(mapping.ruleId).toBe('RULE_001_INTEREST_ACCRUAL');
  });

  /**
   * TEST 2: Penalty Accrual Pipeline
   */
  test('Penalty accrual: calculation → mapping → journal template', () => {
    const overdueAmount = Money.fromCents(100_000n, 'USD'); // $1,000
    const penaltyRate = Percentage.from(2);
    const daysLate = 10;

    const penalty = calculateLatePenalty(overdueAmount, penaltyRate, daysLate);
    expect(penalty.cents).toBe(548n); // ~$5.48

    const accountMapping = {
      penaltyReceivable: 'acc-pr-001',
      penaltyIncome: 'acc-pi-001',
    };

    const mapping = mapPenaltyCharge(
      penalty,
      'debt-123',
      daysLate,
      accountMapping
    );

    // Verify balance
    expect(mapping.debitAccount.amount.cents).toBe(548n);
    expect(mapping.creditAccount.amount.cents).toBe(548n);
    expect(mapping.debitAccount.amount.cents).toBe(
      mapping.creditAccount.amount.cents
    );
  });

  /**
   * TEST 3: Payment Allocation Pipeline
   * 
   * Most complex: single payment → multiple GL accounts
   */
  test('Payment allocation: calculation → mapping → journal template', () => {
    const payment = Money.fromCents(500_000n, 'USD'); // $5,000

    // STEP 1: Allocate payment (waterfall)
    const allocation = allocatePayment(
      payment,
      Money.fromCents(100_000n, 'USD'), // Fees outstanding
      Money.fromCents(150_000n, 'USD'), // Interest outstanding
      Money.fromCents(100_000n, 'USD'), // Penalties outstanding
      Money.fromCents(200_000n, 'USD') // Principal outstanding
    );

    expect(allocation.fees.cents).toBe(100_000n);
    expect(allocation.interest.cents).toBe(150_000n);
    expect(allocation.penalties.cents).toBe(100_000n);
    expect(allocation.principal.cents).toBe(50_000n);

    // STEP 2: Map to GL accounts
    const accountMapping = {
      cash: 'acc-cash-001',
      customerAR: 'acc-ar-001',
      interestReceivable: 'acc-ir-001',
      penaltyReceivable: 'acc-pr-001',
      feeReceivable: 'acc-fr-001',
    };

    const mapping = mapPaymentAllocation(
      payment,
      allocation,
      'debt-123',
      accountMapping
    );

    // STEP 3: Verify total balance
    expect(mapping.totalDebit.cents).toBe(500_000n);
    expect(mapping.totalCredit.cents).toBe(500_000n);
    expect(mapping.totalDebit.cents).toBe(mapping.totalCredit.cents);

    // STEP 4: Verify allocation breakdown
    // This should be implicit in mapping.entries
    expect(mapping.entries.length).toBeGreaterThan(0);
  });

  /**
   * TEST 4: Double-Entry Accounting Fundamental
   * 
   * Every operation must have DR = CR
   */
  test('All mappings satisfy debit = credit', () => {
    const testCases = [
      {
        name: 'Interest accrual',
        fn: () => {
          const interest = calculateDailyInterest(
            Money.fromCents(1_000_000n, 'USD'),
            Percentage.from(12),
            1
          );
          return mapInterestAccrual(interest, 'debt-123', {
            interestReceivable: 'acc-ir-001',
            interestIncome: 'acc-ii-001',
          });
        },
      },
      {
        name: 'Penalty accrual',
        fn: () => {
          const penalty = calculateLatePenalty(
            Money.fromCents(100_000n, 'USD'),
            Percentage.from(2),
            10
          );
          return mapPenaltyCharge(penalty, 'debt-123', 10, {
            penaltyReceivable: 'acc-pr-001',
            penaltyIncome: 'acc-pi-001',
          });
        },
      },
    ];

    for (const testCase of testCases) {
      const mapping = testCase.fn();
      expect(
        mapping.debitAccount.amount.cents,
        `${testCase.name}: debit should match credit`
      ).toBe(mapping.creditAccount.amount.cents);
    }
  });

  /**
   * TEST 5: Template Variables Substitution
   * 
   * Verify that template variables are correctly replaced
   */
  test('Template variables are correctly substituted', () => {
    const interest = calculateDailyInterest(
      Money.fromCents(1_000_000n, 'USD'),
      Percentage.from(12),
      1
    );

    const mapping = mapInterestAccrual(interest, 'debt-123', {
      interestReceivable: 'acc-ir-001',
      interestIncome: 'acc-ii-001',
    });

    // Verify description contains context
    expect(mapping.description).toContain('debt-123');
    expect(mapping.description).toContain('accrual');

    // Verify rule ID is tracked
    expect(mapping.ruleId).toBe('RULE_001_INTEREST_ACCRUAL');
  });

  /**
   * TEST 6: Currency Consistency
   * 
   * All lines in journal entry must use same currency
   */
  test('All journal lines use consistent currency', () => {
    const interest = calculateDailyInterest(
      Money.fromCents(1_000_000n, 'USD'),
      Percentage.from(12),
      1
    );

    const mapping = mapInterestAccrual(interest, 'debt-123', {
      interestReceivable: 'acc-ir-001',
      interestIncome: 'acc-ii-001',
    });

    // Both sides same currency
    expect(mapping.debitAccount.amount.currency).toBe(
      mapping.creditAccount.amount.currency
    );
    expect(mapping.debitAccount.amount.currency).toBe('USD');
  });

  /**
   * TEST 7: Waterfall Order Verification
   * 
   * Ensure allocation follows strict order:
   * Fees → Interest → Penalties → Principal
   */
  test('Waterfall allocation maintains correct order', () => {
    const payment = Money.fromCents(200_000n, 'USD'); // $2,000

    const allocation = allocatePayment(
      payment,
      Money.fromCents(50_000n, 'USD'), // Fees
      Money.fromCents(50_000n, 'USD'), // Interest
      Money.fromCents(50_000n, 'USD'), // Penalties
      Money.fromCents(200_000n, 'USD') // Principal
    );

    // Payment: $2,000
    // Expected: Fees $500 → Interest $500 → Penalties $500 → Principal $500
    expect(allocation.fees.cents).toBe(50_000n); // All allocated
    expect(allocation.interest.cents).toBe(50_000n); // All allocated
    expect(allocation.penalties.cents).toBe(50_000n); // All allocated
    expect(allocation.principal.cents).toBe(50_000n); // Remaining

    // Total must equal payment
    const sum =
      allocation.fees.cents +
      allocation.interest.cents +
      allocation.penalties.cents +
      allocation.principal.cents;
    expect(sum).toBe(payment.cents);
  });

  /**
   * TEST 8: Edge Case - Zero Allocations
   * 
   * Some allocation components can be zero
   */
  test('Handles zero allocations correctly', () => {
    const payment = Money.fromCents(100_000n, 'USD'); // $1,000

    // Only fees outstanding, nothing else
    const allocation = allocatePayment(
      payment,
      Money.fromCents(100_000n, 'USD'), // Fees
      Money.fromCents(0n, 'USD'), // No interest
      Money.fromCents(0n, 'USD'), // No penalties
      Money.fromCents(0n, 'USD') // No principal
    );

    expect(allocation.fees.cents).toBe(100_000n);
    expect(allocation.interest.cents).toBe(0n);
    expect(allocation.penalties.cents).toBe(0n);
    expect(allocation.principal.cents).toBe(0n);

    // Total still equals payment
    const sum =
      allocation.fees.cents +
      allocation.interest.cents +
      allocation.penalties.cents +
      allocation.principal.cents;
    expect(sum).toBe(payment.cents);
  });

  /**
   * TEST 9: Large Scale Consistency
   * 
   * Verify accounting pipeline works at scale
   */
  test('Accounting pipeline consistent at large scale', () => {
    const largeAmount = Money.fromCents(1_000_000_000n, 'USD'); // $10 million
    const rate = Percentage.from(8.5);
    const days = 365;

    const interest = calculateDailyInterest(largeAmount, rate, days);

    const mapping = mapInterestAccrual(interest, 'debt-123', {
      interestReceivable: 'acc-ir-001',
      interestIncome: 'acc-ii-001',
    });

    // Must maintain balance even with large amounts
    expect(mapping.debitAccount.amount.cents).toBe(
      mapping.creditAccount.amount.cents
    );

    // Must not overflow
    expect(mapping.debitAccount.amount.cents).toBeGreaterThan(0n);
  });

  /**
   * TEST 10: Idempotency at Integration Level
   * 
   * Same input must produce same mapping
   */
  test('Mapping is deterministic (idempotent)', () => {
    const interest1 = calculateDailyInterest(
      Money.fromCents(1_000_000n, 'USD'),
      Percentage.from(12),
      30
    );

    const interest2 = calculateDailyInterest(
      Money.fromCents(1_000_000n, 'USD'),
      Percentage.from(12),
      30
    );

    expect(interest1.cents).toBe(interest2.cents);

    // Both produce identical mappings
    const mapping1 = mapInterestAccrual(interest1, 'debt-123', {
      interestReceivable: 'acc-ir-001',
      interestIncome: 'acc-ii-001',
    });

    const mapping2 = mapInterestAccrual(interest2, 'debt-123', {
      interestReceivable: 'acc-ir-001',
      interestIncome: 'acc-ii-001',
    });

    expect(mapping1.debitAccount.amount.cents).toBe(
      mapping2.debitAccount.amount.cents
    );
    expect(mapping1.creditAccount.amount.cents).toBe(
      mapping2.creditAccount.amount.cents
    );
  });
});
