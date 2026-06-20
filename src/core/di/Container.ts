import { Logger, ConsoleLogger } from "@core/telemetry/logging/Logger.ts";
import { Tracer } from "@core/telemetry/tracing/Tracer.ts";

export class Container {
  private services = new Map<string, any>();

  constructor() {
    // تسجيل خدمات الرصد بشكل تلقائي كجزء من بنية النظام
    this.register("Logger", new ConsoleLogger());
    this.register("Tracer", new Tracer());
  }

  register<T>(name: string, instance: T) { this.services.set(name, instance); }
  
  resolve<T>(name: string): T {
    const s = this.services.get(name);
    if (!s) throw new Error(`Service ${name} not found`);
    return s as T;
  }
}
