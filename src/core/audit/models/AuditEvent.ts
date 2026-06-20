export interface AuditEvent {
  actor: string;        // من قام بالفعل
  action: string;       // طبيعة الفعل (مثلاً: UPDATE_SECRET)
  resource: string;     // المورد المتأثر
  status: "SUCCESS" | "FAILURE";
  timestamp: string;
  metadata: Record<string, any>;
}
