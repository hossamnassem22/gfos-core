import { MappingRule } from '../../shared/contracts/AccountingContracts';

export class RuleRegistry {
  private rules: Map<string, MappingRule[]> = new Map();

  register(rule: MappingRule) {
    const list = this.rules.get(rule.eventType) || [];
    list.push(rule);
    // ترتيب القواعد حسب الإصدار
    list.sort((a, b) => b.version - a.version);
    this.rules.set(rule.eventType, list);
  }

  resolve(eventType: string, timestamp: number): MappingRule {
    const options = this.rules.get(eventType);
    const rule = options?.find(r => r.validFrom <= timestamp);
    if (!rule) throw new Error("NO_APPLICABLE_RULE_FOUND");
    return rule;
  }
}
