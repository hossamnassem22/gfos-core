export type PlanType = "free" | "pro" | "enterprise";

export interface PlanLimits {
  maxUsers: number;
  maxRequestsPerDay: number;
  maxStorageMB: number;
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: {
    maxUsers: 1,
    maxRequestsPerDay: 100,
    maxStorageMB: 100,
  },
  pro: {
    maxUsers: 10,
    maxRequestsPerDay: 10000,
    maxStorageMB: 1024,
  },
  enterprise: {
    maxUsers: 9999,
    maxRequestsPerDay: 1000000,
    maxStorageMB: 10240,
  },
};
