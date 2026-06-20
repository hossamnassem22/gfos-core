export class ReputationEngine {
  // نطاق التقييم من 0 إلى 100
  static calculateScore(refundRate: number, transactionVolume: number): number {
    const baseScore = 100;
    const penalty = refundRate * 10;
    return Math.max(0, baseScore - penalty);
  }
}
