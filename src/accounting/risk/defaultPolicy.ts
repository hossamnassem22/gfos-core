import { RiskPolicy } from "./policy.types.ts";

export const DEFAULT_RISK_POLICY: RiskPolicy = {
  thresholds: {
    lowMaxScore: 10,
    mediumMaxScore: 30,
    highMaxScore: 70,
  },
  agingWeights: {
    D0_30: 1,
    D31_60: 2,
    D61_90: 5,
    D90_PLUS: 10,
  },
  rules: {
    minOverdueForHighRisk: 5000,
    minOverdueForCriticalRisk: 20000,
  },
};
