import { ScalingPolicy } from "../policy/ScalingPolicy.ts";

export class DecisionEngine {
  decide(currentLoad: number, policy: ScalingPolicy): "SCALE_UP" | "SCALE_DOWN" | "STABLE" {
    if (currentLoad > policy.threshold) return "SCALE_UP";
    if (currentLoad < policy.threshold / 2) return "SCALE_DOWN";
    return "STABLE";
  }
}
