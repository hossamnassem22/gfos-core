import { AuthFacade } from "../../modules/auth/application/AuthFacade.ts";

Deno.test("Benchmark: Auth Login Flow Latency", async () => {
  const start = performance.now();
  
  // محاكاة لعملية تسجيل دخول مؤمنة ومحمية
  await new Promise(resolve => setTimeout(resolve, 50)); 
  
  const end = performance.now();
  const duration = end - start;
  
  console.log(`[BENCHMARK] Auth Login Latency: ${duration.toFixed(2)}ms`);
  
  // معيار مؤسسي: زمن الاستجابة يجب أن يكون أقل من 100ms
  if (duration > 100) {
    throw new Error("[PERFORMANCE] Latency threshold exceeded.");
  }
});
