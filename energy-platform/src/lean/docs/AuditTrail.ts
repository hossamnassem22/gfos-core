export interface AuditEntry {
  transactionId: string;
  timestamp: string;
  retailerName: string;
  factoryName: string;
  agreementStatus: 'VERIFIED' | 'DISPUTED';
}
export const auditLog: AuditEntry[] = [];
