export class ZeroFloor {
  static validate(value: number): number {
    // "القاع" هنا يمنع القيم السالبة منطقياً في العمليات المالية
    return Math.max(0, value);
  }
}
