import { PlanType } from "./plans.ts";

export interface TenantBilling {
  tenantId: string;
  plan: PlanType;
  requestsToday: number;
  usersCount: number;
  updatedAt: Date;
}
