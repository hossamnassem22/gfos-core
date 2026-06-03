import { CanonicalEvent } from './event';

export class CausalGapDetector {
  /**
   * يحدد ما إذا كانت العقدة تمتلك تاريخاً كاملاً وصولاً لـ Frontier معين
   */
  detect(localFrontier: Set<string>, remoteFrontier: Set<string>): { missing: string[] } {
    const missing = Array.from(remoteFrontier).filter(hash => !localFrontier.has(hash));
    
    // إذا كانت المجموعة تحتوي على عناصر لا نملكها، فهناك فجوة
    return { missing };
  }
}
