export class RiskEngine {
  static calculateTrustScore(pastAgreements: any[]): number {
    if (pastAgreements.length === 0) return 50; // تقييم محايد للمستخدم الجديد
    
    const paidCount = pastAgreements.filter(a => a.status === 'PAID').length;
    return (paidCount / pastAgreements.length) * 100;
  }
}
