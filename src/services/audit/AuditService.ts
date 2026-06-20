import { EventBroker } from "../../infrastructure/messaging/EventBroker.ts";

const logs: any[] = [];

export class AuditService {
  static init() {
    EventBroker.subscribe("PAYMENT_SUCCESS", (event) => {
      logs.push({
        type: "PAYMENT_SUCCESS",
        event,
      });

      console.log("[AUDIT]", event);
    });
  }

  static list() {
    return logs;
  }
}
