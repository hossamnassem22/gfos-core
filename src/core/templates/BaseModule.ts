import { Container } from "@core/di/Container.ts";
import { Logger } from "@core/telemetry/logging/Logger.ts";

export abstract class BaseModule {
  protected logger: Logger;
  constructor(protected container: Container) {
    this.logger = this.container.resolve<Logger>("Logger");
  }
  abstract init(): Promise<void>;
}
