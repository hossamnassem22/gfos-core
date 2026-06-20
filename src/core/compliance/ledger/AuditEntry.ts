export interface AuditEntry {
  transactionId: string;
  timestamp: string;
  proofHash: string; // البصمة الرقمية الناتجة عن الـ ProofGenerator
  isCompliant: boolean;
}
