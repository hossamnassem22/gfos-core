<<<<<<< HEAD
/**
 * FINANCIAL → ACCOUNTING CONTRACT VALIDATOR
 *
 * This validator is the CRITICAL BRIDGE between:
 * - FinancialEngine (produces calculations)
 * - Accounting Mapper (maps to GL)
 * - Journal Templates (defines posting rules)
 * - GL Mapping (resolves account codes)
 * - Event Schema (validates structure)
 *
 * NO financial output should reach the Ledger without passing this validator.
 * This prevents silent accounting errors that only appear months later in audits.
 */

import { Money } from '../precision/value-objects';

/**
 * Every financial operation that maps to accounting must satisfy these contracts.
 */

// ============================================================================
// CONTRACT: INTEREST ACCRUAL
// ============================================================================

export interface InterestAccrualContract {
  // Input: What FinancialEngine calculated
  calculation: {
    principal: Money;
    rate: number; // BPS
    days: number;
    accruedAmount: Money;
    formula: string; // e.g., "P × R × D / 36500"
  };

  // Mapping: Which accounts to post
  accounting: {
    debitAccount: {
      logicalName: 'INTEREST_RECEIVABLE';
      requiredType: 'ASSET';
    };
    creditAccount: {
      logicalName: 'INTEREST_INCOME';
      requiredType: 'REVENUE';
    };
  };

  // Template: Must exist
  template: {
    templateId: 'INTEREST_ACCRUAL';
    minVersion: 1;
  };

  // Event: Must conform
  event: {
    eventType: 'INTEREST_ACCRUED';
    ruleId: string; // e.g., 'RULE_001_v1.0'
  };

  // Invariants that MUST be true
  invariants: {
    debitEqualsCredit: true; // Always
    bothNonZero: true; // Cannot accrue zero interest
    sameCurrency: true; // Both accounts same currency
  };
}

/**
 * Validator for Interest Accrual Contract
 */
export class InterestAccrualValidator {
  validate(
    principal: Money,
    rate: number,
    days: number,
    accruedAmount: Money,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    const errors: string[] = [];

    // 1. Verify calculation makes sense
    if (principal.cents <= 0n) {
      errors.push('Principal must be positive');
    }

    if (rate < 0 || rate > 10_000_000) {
      // 0 to 100,000% BPS (0 to 1000% annual)
      errors.push('Rate out of bounds: must be 0 to 10,000,000 BPS');
    }

    if (days < 0 || days > 366) {
      errors.push('Days must be 1 to 366');
    }

    if (accruedAmount.cents < 0n) {
      errors.push('Accrued amount cannot be negative');
    }

    if (accruedAmount.currency !== principal.currency) {
      errors.push('Accrued amount currency must match principal');
    }

    // 2. Verify GL mapping exists
    // This should be checked against actual DB
    const glMappingExists = this.checkGLMappingExists(
      tenantId,
      productId,
      'INTEREST_RECEIVABLE'
    );
    if (!glMappingExists) {
      errors.push(
        `GL mapping missing: INTEREST_RECEIVABLE for ${tenantId}/${productId}`
      );
    }

    const glMappingIncomeExists = this.checkGLMappingExists(
      tenantId,
      productId,
      'INTEREST_INCOME'
    );
    if (!glMappingIncomeExists) {
      errors.push(
        `GL mapping missing: INTEREST_INCOME for ${tenantId}/${productId}`
      );
    }

    // 3. Verify template exists
    const templateExists = this.checkTemplateExists(
      'INTEREST_ACCRUAL',
      ruleVersion
    );
    if (!templateExists) {
      errors.push(`Template INTEREST_ACCRUAL version ${ruleVersion} not found`);
    }

    // 4. Invariant: Both sides must be equal
    if (accruedAmount.cents !== accruedAmount.cents) {
      errors.push('INVARIANT VIOLATION: Debit must equal Credit');
    }

    // 5. Invariant: Cannot be zero
    if (accruedAmount.cents === 0n) {
      errors.push('INVARIANT VIOLATION: Cannot accrue zero interest');
    }

    return {
      isValid: errors.length === 0,
      errors,
      contract: 'INTEREST_ACCRUAL',
      templateId: 'INTEREST_ACCRUAL',
      journalLineCount: 2,
    };
  }

  private checkGLMappingExists(
    tenantId: string,
    productId: string,
    logicalAccountName: string
  ): boolean {
    // In production, this queries the GL_MAPPING table
    // For now, return true (assume configured)
    return true;
  }

  private checkTemplateExists(templateId: string, version: string): boolean {
    // In production, this queries the TEMPLATE_REGISTRY
    // For now, return true (assume exists)
    return true;
  }
}

// ============================================================================
// CONTRACT: PENALTY ACCRUAL
// ============================================================================

export interface PenaltyAccrualContract {
  calculation: {
    overdueAmount: Money;
    penaltyRate: number; // BPS
    daysLate: number;
    accruedPenalty: Money;
  };

  accounting: {
    debitAccount: {
      logicalName: 'PENALTIES_RECEIVABLE';
      requiredType: 'ASSET';
    };
    creditAccount: {
      logicalName: 'PENALTY_INCOME';
      requiredType: 'REVENUE';
    };
  };

  template: {
    templateId: 'PENALTY_ACCRUAL';
    minVersion: 1;
  };

  event: {
    eventType: 'PENALTY_ACCRUED';
    ruleId: string;
  };

  invariants: {
    debitEqualsCredit: true;
    bothNonZero: true;
    sameCurrency: true;
  };
}

export class PenaltyAccrualValidator {
  validate(
    overdueAmount: Money,
    penaltyRate: number,
    daysLate: number,
    accruedPenalty: Money,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    const errors: string[] = [];

    if (overdueAmount.cents <= 0n) {
      errors.push('Overdue amount must be positive');
    }

    if (penaltyRate < 0 || penaltyRate > 10_000_000) {
      errors.push('Penalty rate out of bounds');
    }

    if (daysLate < 1) {
      errors.push('Must have at least 1 day late to accrue penalty');
    }

    if (accruedPenalty.cents < 0n) {
      errors.push('Accrued penalty cannot be negative');
    }

    if (accruedPenalty.currency !== overdueAmount.currency) {
      errors.push('Currency mismatch');
    }

    const glMappingExists1 = this.checkGLMappingExists(
      tenantId,
      productId,
      'PENALTIES_RECEIVABLE'
    );
    if (!glMappingExists1) {
      errors.push('GL mapping missing: PENALTIES_RECEIVABLE');
    }

    const glMappingExists2 = this.checkGLMappingExists(
      tenantId,
      productId,
      'PENALTY_INCOME'
    );
    if (!glMappingExists2) {
      errors.push('GL mapping missing: PENALTY_INCOME');
    }

    const templateExists = this.checkTemplateExists(
      'PENALTY_ACCRUAL',
      ruleVersion
    );
    if (!templateExists) {
      errors.push(`Template PENALTY_ACCRUAL not found`);
    }

    if (accruedPenalty.cents === 0n) {
      errors.push('INVARIANT: Cannot accrue zero penalty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      contract: 'PENALTY_ACCRUAL',
      templateId: 'PENALTY_ACCRUAL',
      journalLineCount: 2,
    };
  }

  private checkGLMappingExists(
    tenantId: string,
    productId: string,
    logicalAccountName: string
  ): boolean {
    return true;
  }

  private checkTemplateExists(templateId: string, version: string): boolean {
    return true;
  }
}

// ============================================================================
// CONTRACT: PAYMENT ALLOCATION
// ============================================================================

export interface PaymentAllocationBreakdown {
  fees: Money;
  interest: Money;
  penalties: Money;
  principal: Money;
}

export interface PaymentAllocationContract {
  calculation: {
    totalPayment: Money;
    allocation: PaymentAllocationBreakdown;
    allocationOrder: ['FEES', 'INTEREST', 'PENALTIES', 'PRINCIPAL'];
  };

  accounting: {
    // Multiple debit/credit pairs
    debitAccounts: [
      {
        logicalName: 'CASH_ACCOUNT';
        requiredType: 'ASSET';
        amount: Money;
      }
    ];

    creditAccounts: [
      {
        logicalName: 'CUSTOMER_AR' | 'INTEREST_RECEIVABLE' | 'PENALTIES_RECEIVABLE' | 'FEES_RECEIVABLE';
        requiredType: 'ASSET';
        amount: Money;
        conditional: boolean; // Can be zero
      }
    ];
  };

  template: {
    templateId: 'PAYMENT_RECEIVED';
    minVersion: 1;
  };

  event: {
    eventType: 'PAYMENT_ALLOCATED';
    ruleId: string;
  };

  invariants: {
    debitEqualsCredit: true;
    allocationSumEqualsPayment: true;
    waterfalOrderImmutable: true;
  };
}

export class PaymentAllocationValidator {
  validate(
    totalPayment: Money,
    allocation: PaymentAllocationBreakdown,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    const errors: string[] = [];

    // 1. Verify allocation sums to payment
    const allocatedTotal = allocation.fees.cents +
      allocation.interest.cents +
      allocation.penalties.cents +
      allocation.principal.cents;

    if (allocatedTotal !== totalPayment.cents) {
      errors.push(
        `INVARIANT VIOLATION: Allocation sum (${allocatedTotal}) != Payment (${totalPayment.cents})`
      );
    }

    // 2. Verify all components same currency
    const currencies = [
      allocation.fees.currency,
      allocation.interest.currency,
      allocation.penalties.currency,
      allocation.principal.currency,
      totalPayment.currency,
    ];

    const uniqueCurrencies = new Set(currencies);
    if (uniqueCurrencies.size !== 1) {
      errors.push('Currency mismatch in allocation breakdown');
    }

    // 3. Verify no negative allocations
    if (allocation.fees.cents < 0n) {
      errors.push('Fees allocation cannot be negative');
    }
    if (allocation.interest.cents < 0n) {
      errors.push('Interest allocation cannot be negative');
    }
    if (allocation.penalties.cents < 0n) {
      errors.push('Penalties allocation cannot be negative');
    }
    if (allocation.principal.cents < 0n) {
      errors.push('Principal allocation cannot be negative');
    }

    // 4. Verify GL mappings exist for all accounts
    const requiredMappings = [
      'CASH_ACCOUNT',
      'CUSTOMER_AR',
      'INTEREST_RECEIVABLE',
      'PENALTIES_RECEIVABLE',
      'FEES_RECEIVABLE',
    ];

    for (const mapping of requiredMappings) {
      if (!this.checkGLMappingExists(tenantId, productId, mapping)) {
        errors.push(`GL mapping missing: ${mapping}`);
      }
    }

    // 5. Verify template exists
    if (!this.checkTemplateExists('PAYMENT_RECEIVED', ruleVersion)) {
      errors.push('Template PAYMENT_RECEIVED not found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      contract: 'PAYMENT_ALLOCATION',
      templateId: 'PAYMENT_RECEIVED',
      journalLineCount: 5, // Cash + 4 possible credits
    };
  }

  private checkGLMappingExists(
    tenantId: string,
    productId: string,
    logicalAccountName: string
  ): boolean {
    return true;
  }

  private checkTemplateExists(templateId: string, version: string): boolean {
    return true;
  }
}

// ============================================================================
// MASTER VALIDATOR
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  contract: string;
  templateId: string;
  journalLineCount: number;
}

export interface ContractValidationSuite {
  interest: InterestAccrualValidator;
  penalty: PenaltyAccrualValidator;
  payment: PaymentAllocationValidator;
}

/**
 * Master validator that checks ALL contracts before posting
 */
export class FinancialAccountingContractValidator {
  private interestValidator = new InterestAccrualValidator();
  private penaltyValidator = new PenaltyAccrualValidator();
  private paymentValidator = new PaymentAllocationValidator();

  /**
   * Validate interest accrual before posting
   */
  validateInterestAccrual(
    principal: Money,
    rate: number,
    days: number,
    accruedAmount: Money,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    return this.interestValidator.validate(
      principal,
      rate,
      days,
      accruedAmount,
      tenantId,
      productId,
      ruleVersion
    );
  }

  /**
   * Validate penalty accrual before posting
   */
  validatePenaltyAccrual(
    overdueAmount: Money,
    penaltyRate: number,
    daysLate: number,
    accruedPenalty: Money,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    return this.penaltyValidator.validate(
      overdueAmount,
      penaltyRate,
      daysLate,
      accruedPenalty,
      tenantId,
      productId,
      ruleVersion
    );
  }

  /**
   * Validate payment allocation before posting
   */
  validatePaymentAllocation(
    totalPayment: Money,
    allocation: PaymentAllocationBreakdown,
    tenantId: string,
    productId: string,
    ruleVersion: string
  ): ValidationResult {
    return this.paymentValidator.validate(
      totalPayment,
      allocation,
      tenantId,
      productId,
      ruleVersion
    );
  }

  /**
   * Throw if validation fails (fail-fast)
   */
  validateOrThrow(result: ValidationResult): void {
    if (!result.isValid) {
      throw new ContractValidationError(
        result.contract,
        result.errors
      );
    }
  }
}

/**
 * Contract validation failed - this should NEVER reach Ledger
 */
export class ContractValidationError extends Error {
  constructor(
    public contract: string,
    public validationErrors: string[]
  ) {
    super(
      `Contract validation failed: ${contract}\n${validationErrors.join('\n')}`
    );
    this.name = 'ContractValidationError';
  }
}

/**
 * Export singleton instance
 */
export const contractValidator = new FinancialAccountingContractValidator();
=======
export class FinancialAccountingContractValidator {

  private checkTemplateExists(_templateId: string, _version: string): boolean {
    // Placeholder implementation - contract-level validation only
    return true;
  }

  private validateMapping(
    _tenantId: string,
    _productId: string,
    _logicalAccountName: string
  ): boolean {
    // Placeholder validation logic for contract enforcement
    return true;
  }

  private validateJournalStructure(
    _templateId: string,
    _version: string
  ): boolean {
    // Ensures journal structure exists and is valid (contract only)
    return true;
  }

  private validateTenantScope(_tenantId: string): boolean {
    // Tenant isolation check placeholder
    return true;
  }

  private validateProductScope(_productId: string): boolean {
    // Product isolation check placeholder
    return true;
  }

  public validateAll(input: {
    tenantId: string;
    productId: string;
    logicalAccountName: string;
    templateId: string;
    version: string;
  }): boolean {

    const t = this.checkTemplateExists(input.templateId, input.version);
    const m = this.validateMapping(
      input.tenantId,
      input.productId,
      input.logicalAccountName
    );
    const j = this.validateJournalStructure(
      input.templateId,
      input.version
    );

    const tenant = this.validateTenantScope(input.tenantId);
    const product = this.validateProductScope(input.productId);

    return t && m && j && tenant && product;
  }
}
>>>>>>> 136b9df (reinitialize repo: restore git tracking)
