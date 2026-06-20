export class RiskMonitor {
  static flagMerchant(merchantId: string, score: number) {
    if (score < 50) {
      console.warn(`[RISK] Merchant ${merchantId} flagged for audit due to low score.`);
    }
  }
}
