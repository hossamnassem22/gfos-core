export interface Policy {
  version: string;
  rules: {
    criticalScore: number;
    highScore: number;
    mediumScore: number;
  };
}

export class PolicyEngine {
  constructor(private policy: Policy) {}

  evaluate(score: number): { level: string, action: string } {
    if (score >= this.policy.rules.criticalScore) 
        return { level: "CRITICAL", action: "ESCALATE" };
    if (score >= this.policy.rules.highScore) 
        return { level: "HIGH", action: "CALL" };
    return { level: "MEDIUM", action: "MONITOR" };
  }
}
