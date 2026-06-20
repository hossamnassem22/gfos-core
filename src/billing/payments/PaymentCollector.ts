export class PaymentCollector {
  static processPayment(billId: string, amount: number) {
    console.log(`[BILLING] Processing payment for Bill ${billId}: $${amount}`);
    // الربط مع البنوك وتحديث سجلات العميل
  }
}
