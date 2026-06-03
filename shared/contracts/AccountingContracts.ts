export interface LedgerEntry {
  entryId: string;
  eventId: string;
  ruleId: string;
  ruleVersion: number;
  debitAccountId: string;
  creditAccountId: string;
  amount: bigint;
  currency: string;
  createdAt: number;
}

export interface RuleContext {
  accounts: { get: (id: string) => { id: string; type: string } };
}

export interface MappingRule<T = any> {
  ruleId: string;
  version: number;
  eventType: string;
  match(event: T): boolean;
  transform(event: T, ctx: RuleContext): LedgerEntry[];
}
