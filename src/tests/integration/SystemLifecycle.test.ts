import { Container } from "@core/di/Container.ts";
import { MetricsCollector } from "@core/telemetry/MetricsCollector.ts";
import { ModuleRegistry } from "@core/registry/ModuleRegistry.ts";
import { AuthModule } from "@modules/auth/AuthModule.ts";

Deno.test("Full System Lifecycle Integration", async () => {
  const container = new Container();
  container.register("MetricsCollector", new MetricsCollector());
  
  const registry = new ModuleRegistry();
  const auth = new AuthModule(container);
  
  registry.register(auth);
  await registry.bootstrap();
  
  const facade = container.resolve("AuthFacade");
  if (!facade) throw new Error("AuthFacade initialization failed");
  
  console.log("System verified successfully.");
});
