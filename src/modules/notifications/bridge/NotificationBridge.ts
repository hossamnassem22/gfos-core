import { EventBus } from "@core/events/bus/EventBus.ts";
import { NotificationDispatcher } from "../dispatcher/NotificationDispatcher.ts";

export class NotificationBridge {
  constructor(bus: EventBus, private dispatcher: NotificationDispatcher) {
    bus.subscribe("USER_LOGIN", async (data) => {
      await this.dispatcher.dispatch({
        recipientId: data.userId,
        channel: "SYSTEM",
        templateId: "LOGIN_ALERT",
        data: { time: data.timestamp },
        priority: "LOW"
      });
    });
  }
}
