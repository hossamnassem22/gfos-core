import { EventBroker } from "../../infrastructure/messaging/EventBroker.ts";

export class BillingService {
  static charge(userId: string, amount: number) {
    // simulate payment success
    EventBroker.publish("PAYMENT_SUCCESS", {
      userId,
      amount,
      timestamp: Date.now(),
    });

    return { status: "charged" };
  }
}
