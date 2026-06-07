import { AuditLogger } from "./AuditLogger.ts";

// داخل الـ Route الخاص بالدفع:
await AuditLogger.log(
  userId, 
  "PAYMENT_RECEIVED", 
  { debtId, amountCents, timestamp: new Date() }
);
