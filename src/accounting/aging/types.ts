import { AccountStatement } from "../types.ts";

export interface AgingProfile {
  customerId: string;
  buckets: {
    CURRENT: number;
    D30_60: number;
    D60_90: number;
    D90_PLUS: number;
  };
  totalOverdue: number;
  oldestDebtDays: number;
}

export interface AgingEngine {
  buildProfile(customerId: string, statement: AccountStatement): AgingProfile;
}
