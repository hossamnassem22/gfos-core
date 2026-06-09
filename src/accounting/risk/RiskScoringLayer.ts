import { AgingProfile } from "../aging/types.ts";
import { RiskAssessment } from "../../collections/RiskScoring.ts";
import { PolicyEngine } from "./PolicyEngine.ts";
import { DEFAULT_RISK_POLICY } from "./defaultPolicy.ts";

export class RiskScoringLayerImpl {
  private engine = new PolicyEngine();

  score(profile: AgingProfile): RiskAssessment {
    const level = this.engine.evaluate(profile, DEFAULT_RISK_POLICY);
    
    // ربط مخرجات السياسة بقرارات التنفيذ
    return {
      customerId: profile.customerId,
      score: 0, 
      level,
      recommendedAction: level === "CRITICAL" ? "ESCALATE" : (level === "HIGH" ? "CALL" : "MONITOR"),
      metadata: { agingScore: 0, behavioralScore: 0 }
    };
  }
}
