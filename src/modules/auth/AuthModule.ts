import { BaseModule } from "@core/templates/BaseModule.ts";
import { EventBus } from "@core/events/bus/EventBus.ts";

export class AuthModule extends BaseModule {
  async init(): Promise<void> {
    const bus = this.container.resolve<EventBus>("EventBus");
    this.logger.info("AuthModule initialized with EventBus integration.");
    
    // مثال لنشر حدث
    bus.publish("USER_LOGIN", { userId: "user-123", timestamp: Date.now() });
  }
}
