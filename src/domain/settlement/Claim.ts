import { Money } from "../ledger/Money.ts";

export enum Priority { CRITICAL = 0, SENIOR = 1, JUNIOR = 2, RESIDUAL = 3 }

export type AllocationRule = 
  | { type: 'FIXED_PERCENTAGE'; value: number }
  | { type: 'FIXED_AMOUNT'; amount: Money }
  | { type: 'REMAINING_BALANCE' };

export interface Claim {
  readonly claimantId: string;
  readonly priority: Priority;
  readonly rule: AllocationRule;
}
