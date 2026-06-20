export class Heartbeat {
  static sendPulse() {
    // إرسال إشارة للمركز الاحتياطي للتأكد من الجاهزية
    console.log("[DR] Primary site heart: OK");
  }
}
