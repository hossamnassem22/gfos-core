// Financial Precision: All money is stored as BIGINT (minor units)
export type Money = bigint;
export type MoneyNumber = number; // For calculations, then convert to Money

// Tenant Isolation
export type TenantId = string;
export type UserId = string;
export type DebtId = string;
export type JournalEntryId = string;

// Ledger Account
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum EntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED'
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  WRITTEN_OFF = 'WRITTEN_OFF',
  DISPUTED = 'DISPUTED'
}

// Core Financial Event
export interface FinancialEvent {
  id: string;
  tenantId: TenantId;
  type: 'DEBT_CREATED' | 'PAYMENT_RECEIVED' | 'PENALTY_APPLIED';
  aggregateId: string;
  payload: unknown;
  occurredAt: Date;
  idempotencyKey: string;
}
