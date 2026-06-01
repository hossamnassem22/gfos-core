/**
 * ACCOUNTING MAPPER: Converts Financial Calculations to GL Accounts
 * 
 * Takes output from FinancialEngine and maps to:
 * - Debit Account
 * - Credit Account
 * - Journal Entry Template
 */

import { Money } from '../precision/value-objects';

export interface AccountingMapping {
  debitAccount: {
    accountId: string;
    accountCode: string;
    accountName: string;
    amount: Money;
  };
  creditAccount: {
    accountId: string;
    accountCode: string;
    accountName: string;
    amount: Money;
  };
  description: string;
  ruleId: string;
}

/**
 * Map interest accrual to GL accounts
 * 
 * DR Interest Receivable (ASSET)
 * CR Interest Income (INCOME)
 */
export function mapInterestAccrual(
  accruedInterest: Money,
  loanId: string,
  accountMapping: { interestReceivable: string; interestIncome: string }
): AccountingMapping {
  if (accruedInterest.cents <= 0n) {
    throw new Error('Interest amount must be positive');
  }

  return {
    debitAccount: {
      accountId: accountMapping.interestReceivable,
      accountCode: '1200',
      accountName: 'Interest Receivable',
      amount: accruedInterest,
    },
    creditAccount: {
      accountId: accountMapping.interestIncome,
      accountCode: '4200',
      accountName: 'Interest Income',
      amount: accruedInterest,
    },
    description: `Interest accrual for loan ${loanId}`,
    ruleId: 'RULE_001_INTEREST_ACCRUAL',
  };
}

/**
 * Map penalty charge to GL accounts
 * 
 * DR Penalties Receivable (ASSET)
 * CR Penalty Income (INCOME)
 */
export function mapPenaltyCharge(
  penaltyAmount: Money,
  loanId: string,
  daysLate: number,
  accountMapping: { penaltyReceivable: string; penaltyIncome: string }
): AccountingMapping {
  if (penaltyAmount.cents <= 0n) {
    throw new Error('Penalty amount must be positive');
  }

  return {
    debitAccount: {
      accountId: accountMapping.penaltyReceivable,
      accountCode: '1300',
      accountName: 'Penalties Receivable',
      amount: penaltyAmount,
    },
    creditAccount: {
      accountId: accountMapping.penaltyIncome,
      accountCode: '4300',
      accountName: 'Penalty Income',
      amount: penaltyAmount,
    },
    description: `Late penalty for loan ${loanId} (${daysLate} days late)`,
    ruleId: 'RULE_002_PENALTY_CHARGE',
  };
}

/**
 * Map payment allocation to GL accounts
 * 
 * This is complex because a single payment may hit multiple accounts
 */
export interface PaymentAllocationMapping {
  entries: AccountingMapping[];
  totalDebit: Money;
  totalCredit: Money;
}

export function mapPaymentAllocation(
  paymentAmount: Money,
  allocationBreakdown: {
    principal: Money;
    interest: Money;
    penalties: Money;
    fees: Money;
  },
  loanId: string,
  accountMapping: {
    cash: string;
    customerAR: string;
    interestReceivable: string;
    penaltyReceivable: string;
    feeReceivable: string;
  }
): PaymentAllocationMapping {
  const entries: AccountingMapping[] = [];

  // DR Cash (ASSET)
  // CR multiple accounts
  entries.push({
    debitAccount: {
      accountId: accountMapping.cash,
      accountCode: '1010',
      accountName: 'Cash',
      amount: paymentAmount,
    },
    creditAccount: {
      accountId: accountMapping.customerAR, // Multiple CRs
      accountCode: '1100',
      accountName: 'Customer A/R',
      amount: allocationBreakdown.principal,
    },
    description: `Payment for loan ${loanId}`,
    ruleId: 'RULE_003_PAYMENT_ALLOCATION',
  });

  // Calculate total credits
  const totalCredit = {
    principal: allocationBreakdown.principal.cents,
    interest: allocationBreakdown.interest.cents,
    penalties: allocationBreakdown.penalties.cents,
    fees: allocationBreakdown.fees.cents,
  };

  return {
    entries,
    totalDebit: paymentAmount,
    totalCredit: Money.fromCents(
      totalCredit.principal +
        totalCredit.interest +
        totalCredit.penalties +
        totalCredit.fees,
      paymentAmount.currency
    ),
  };
}
