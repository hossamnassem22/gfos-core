export class DisputeHandler {
  static resolve(contractValue: number, deliveryStatus: string): number {
    if (deliveryStatus === 'DAMAGED') {
      return contractValue * 0.5; // تعويض افتراضي 50%
    }
    return 0;
  }
}
