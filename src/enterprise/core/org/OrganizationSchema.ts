export interface EnterpriseAccount {
  companyId: string;
  departments: string[];
  subscriptionTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  complianceLevel: 'ISO' | 'GDPR' | 'FINANCIAL';
}
