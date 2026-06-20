import { PLANS, PlanType } from "./plans.ts";

export class BillingPolicy {
  static checkRequestLimit(plan: PlanType, usedToday: number) {
    const limit = PLANS[plan].maxRequestsPerDay;

    if (usedToday >= limit) {
      throw new Error("Request limit exceeded for plan: " + plan);
    }
  }

  static checkUserLimit(plan: PlanType, currentUsers: number) {
    const limit = PLANS[plan].maxUsers;

    if (currentUsers >= limit) {
      throw new Error("User limit exceeded for plan: " + plan);
    }
  }
}
