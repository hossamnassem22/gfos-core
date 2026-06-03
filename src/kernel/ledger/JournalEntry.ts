export interface JournalEntry {
  id: string;
  tenantId: string;
  sequenceNumber: bigint;
  lines: Array<{ accountId: string; debit: bigint; credit: bigint }>;
  previousHash: string;
  currentHash: string;
  merkleLeafHash: string;
}
