// src/domain/ledger/ledger-line.ts
export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface LedgerLine {
  accountId: string;
  amount: bigint; // استخدام BigInt للقيم المالية
  type: EntryType;
  description: string;
}
