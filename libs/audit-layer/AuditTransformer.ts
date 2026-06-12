import crypto from 'crypto';

export interface AuditEvent {
  id: string;
  type: string;
  payload: any;
  ledgerHash: string;
  proofHash: string;
  signature: string;
}

export class AuditTransformer {
  constructor(private privateKey: string) {}

  transform(internalEvent: any): AuditEvent {
    // Canonicalization (ترتيب المفاتيح لضمان Hash ثابت)
    const canonical = JSON.stringify(internalEvent, Object.keys(internalEvent).sort());
    
    // التوقيع الرقمي
    const signer = crypto.createSign('SHA256');
    signer.update(canonical);
    const signature = signer.sign(this.privateKey, 'hex');

    return {
      id: internalEvent.id,
      type: internalEvent.type,
      payload: internalEvent.payload,
      ledgerHash: internalEvent.ledgerHash,
      proofHash: internalEvent.proofHash,
      signature
    };
  }
}
