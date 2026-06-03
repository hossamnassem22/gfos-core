// ... الكود السابق ...
module.exports = { EntryType };
export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface LedgerLine {
  accountId: string;
  amount: bigint;
  type: EntryType;
  description: string;
}

// ... الكود السابق ...
module.exports = { EntryType };
