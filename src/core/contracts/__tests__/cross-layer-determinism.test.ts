/**
 * CROSS-LAYER DETERMINISM TESTS (Step 3 of 3)
 */

import { describe, it, expect } from '@jest/globals';
import {
  contractValidator,
  ContractValidationError,
} from '../financial-accounting-contract.validator';
import {
  GOLDEN_FIXTURES,
  GoldenFixtureValidator,
  validateAllGoldenFixtures,
} from '../golden-journal-fixtures';
import { Money } from '../../precision/value-objects';

describe('Cross-Layer Determinism Tests', () => {
  describe('Golden Fixtures Integrity', () => {
    it('all golden fixtures have valid structure', () => {
      const result = validateAllGoldenFixtures();
      expect(result.failed).toBe(0);
      expect(result.errors.length).toBe(0);
      expect(result.passed).toBeGreaterThan(0);
    });

    it('all journal entries balance', () => {
      for (const [name, fixture] of Object.entries(GOLDEN_FIXTURES)) {
        if ((fixture as any).shouldValidateFail) continue;
        const isValid = GoldenFixtureValidator.validateJournalBalance(fixture);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Interest Accrual Determinism', () => {
    it('same input produces same output', () => {
      const fixture = GOLDEN_FIXTURES.INTEREST_ACCRUAL_30_DAYS;
      const { input, expectedOutput } = fixture;

      const result1 = contractValidator.validateInterestAccrual(
        input.principal,
        input.rate,
        input.days,
        expectedOutput.accruedAmount,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_001_v1.0'
      );

      const result2 = contractValidator.validateInterestAccrual(
        input.principal,
        input.rate,
        input.days,
        expectedOutput.accruedAmount,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_001_v1.0'
      );

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.templateId).toBe(result2.templateId);
    });

    it('1000 identical runs produce same result', () => {
      const fixture = GOLDEN_FIXTURES.INTEREST_ACCRUAL_30_DAYS;
      const { input, expectedOutput } = fixture;

      const results = [];
      for (let i = 0; i < 1000; i++) {
        const result = contractValidator.validateInterestAccrual(
          input.principal,
          input.rate,
          input.days,
          expectedOutput.accruedAmount,
          'TENANT_A',
          'PRODUCT_A',
          'RULE_001_v1.0'
        );
        results.push(result.isValid);
      }

      const allSame = results.every((r) => r === results[0]);
      expect(allSame).toBe(true);
    });
  });

  describe('Penalty Accrual Determinism', () => {
    it('same input produces same output', () => {
      const fixture = GOLDEN_FIXTURES.PENALTY_ACCRUAL_10_DAYS;
      const { input, expectedOutput } = fixture;

      const result1 = contractValidator.validatePenaltyAccrual(
        input.overdueAmount,
        input.penaltyRate,
        input.daysLate,
        expectedOutput.accruedPenalty,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_002_v1.0'
      );

      const result2 = contractValidator.validatePenaltyAccrual(
        input.overdueAmount,
        input.penaltyRate,
        input.daysLate,
        expectedOutput.accruedPenalty,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_002_v1.0'
      );

      expect(result1.isValid).toBe(result2.isValid);
    });
  });

  describe('Payment Allocation Determinism', () => {
    it('waterfall allocation is deterministic', () => {
      const fixture = GOLDEN_FIXTURES.PAYMENT_ALLOCATION_WATERFALL;
      const { input, expectedOutput } = fixture;

      const result1 = contractValidator.validatePaymentAllocation(
        input.totalPayment,
        expectedOutput.allocation,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_003_v1.0'
      );

      const result2 = contractValidator.validatePaymentAllocation(
        input.totalPayment,
        expectedOutput.allocation,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_003_v1.0'
      );

      expect(result1.isValid).toBe(result2.isValid);
    });
  });

  describe('Edge Cases', () => {
    it('zero accrual always rejected', () => {
      const fixture = GOLDEN_FIXTURES.ZERO_ACCRUAL;
      const { input } = fixture;

      const result = contractValidator.validateInterestAccrual(
        input.principal,
        input.rate,
        input.days,
        Money.fromCents(0n, 'USD'),
        'TENANT_A',
        'PRODUCT_A',
        'RULE_001_v1.0'
      );

      expect(result.isValid).toBe(false);
    });

    it('negative principal always rejected', () => {
      const fixture = GOLDEN_FIXTURES.NEGATIVE_PRINCIPAL;
      const { input } = fixture;

      const result = contractValidator.validateInterestAccrual(
        input.principal,
        input.rate,
        input.days,
        Money.fromCents(0n, 'USD'),
        'TENANT_A',
        'PRODUCT_A',
        'RULE_001_v1.0'
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe('Template ID Consistency', () => {
    it('interest always maps to INTEREST_ACCRUAL', () => {
      const fixture = GOLDEN_FIXTURES.INTEREST_ACCRUAL_30_DAYS;
      const { input, expectedOutput } = fixture;

      const result = contractValidator.validateInterestAccrual(
        input.principal,
        input.rate,
        input.days,
        expectedOutput.accruedAmount,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_001_v1.0'
      );

      expect(result.templateId).toBe('INTEREST_ACCRUAL');
    });

    it('penalty always maps to PENALTY_ACCRUAL', () => {
      const fixture = GOLDEN_FIXTURES.PENALTY_ACCRUAL_10_DAYS;
      const { input, expectedOutput } = fixture;

      const result = contractValidator.validatePenaltyAccrual(
        input.overdueAmount,
        input.penaltyRate,
        input.daysLate,
        expectedOutput.accruedPenalty,
        'TENANT_A',
        'PRODUCT_A',
        'RULE_002_v1.0'
      );

      expect(result.templateId).toBe('PENALTY_ACCRUAL');
    });
  });
});
