import { EscrowContract } from '../EscrowContract.ts';

export class DeliveryVerifier {
  static verifyAndRelease(dealId: string, isDelivered: boolean) {
    if (isDelivered) {
      console.log("[VERIFIER] Delivery confirmed. Triggering release...");
      EscrowContract.releaseFunds(dealId);
    }
  }
}
