import { Container } from "@core/di/Container.ts";
import { AuthFacade } from "@modules/auth/application/AuthFacade.ts";

Deno.bench("AuthFacade.login Latency Benchmark", async () => {
  const container = new Container();
  // تجهيز بيئة الاختبار
  const facade = container.resolve<AuthFacade>("AuthFacade");
  
  // قياس زمن العملية
  const start = performance.now();
  await facade.login("test@example.com");
  const end = performance.now();
  
  if ((end - start) > 10) {
    throw new Error("Performance SLA Violation: Latency exceeded 10ms");
  }
});
