import { RULES_V1 } from "./rules.dsl.ts";

export interface Violation {
  from: string;
  to: string;
  rule: string;
}

export class RulesEngine {
  validate(edges: { from: string; to: string }[]) {
    const violations: Violation[] = [];

    for (const edge of edges) {
      for (const rule of RULES_V1.forbiddenEdges) {
        const fromMatch = edge.from.includes(rule.from);

        const toMatch = rule.to.some(t => edge.to.includes(t));

        if (fromMatch && toMatch) {
          violations.push({
            from: edge.from,
            to: edge.to,
            rule: `${rule.from} -> ${rule.to.join(",")}`,
          });
        }
      }
    }

    return violations;
  }
}
