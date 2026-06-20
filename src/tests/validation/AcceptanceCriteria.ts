export interface AcceptanceCriteria {
  latencyThreshold: number; // بالملي ثانية
  securityAuditPass: boolean;
  dataConsistencyRate: number; // 99.999%
  selfHealingEfficiency: number;
}
