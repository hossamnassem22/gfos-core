import { EventBus } from "@core/events/bus/EventBus.ts";

export class SystemHealthListener {
  constructor(private bus: EventBus) {
    this.bus.subscribe("SYSTEM_CRITICAL_FAILURE", async (data) => {
      console.error("[ALERT] Critical System Failure detected:", data);
      // هنا يتم إضافة منطق الإغلاق الآمن أو التنبيه الفوري
    });
  }
}
