export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskPolicy {
  thresholds: {
    lowMaxScore: number;
    mediumMaxScore: number;
    highMaxScore: number;
  };
  agingWeights: {
    D0_30: number;
    D31_60: number;
    D61_90: number;
    D90_PLUS: number;
  };
  rules: {
    minOverdueForHighRisk: number;
    minOverdueForCriticalRisk: number;
  };
}
