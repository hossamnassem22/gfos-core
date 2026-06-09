import { AgingProfile } from "../aging/types.ts";
import { RiskPolicy, RiskLevel } from "./policy.types.ts";

export class PolicyEngine {
  evaluate(profile: AgingProfile, policy: RiskPolicy): RiskLevel {
    const buckets = profile.buckets;
    const weightedScore =
      buckets.CURRENT * policy.agingWeights.D0_30 +
      buckets.D30_60 * policy.agingWeights.D31_60 +
      buckets.D60_90 * policy.agingWeights.D61_90 +
      buckets.D90_PLUS * policy.agingWeights.D90_PLUS;

    if (
      profile.totalOverdue >= policy.rules.minOverdueForCriticalRisk ||
      weightedScore >= policy.thresholds.highMaxScore
    ) return "CRITICAL";

    if (
      profile.totalOverdue >= policy.rules.minOverdueForHighRisk ||
      weightedScore >= policy.thresholds.mediumMaxScore
    ) return "HIGH";

    if (weightedScore >= policy.thresholds.lowMaxScore) return "MEDIUM";

    return "LOW";
  }
}
