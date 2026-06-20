export class PushNotifier {
  static notify(merchantId: string, message: string) {
    console.log(`[PUSH] Alert to Merchant ${merchantId}: ${message}`);
    // الربط مع نظام الإشعارات الفوري (WebSockets)
  }
}
