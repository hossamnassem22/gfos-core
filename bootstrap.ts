import { Container } from "./src/core/di/Container.ts";
import { ConfigProvider } from "./src/core/config/provider/ConfigProvider.ts";
import { SecretManager } from "./src/core/config/secrets/SecretManager.ts";

async function boot() {
  const container = new Container();
  const config = new ConfigProvider();
  
  // التحقق من الأسرار قبل البدء
  const apiKey = SecretManager.getSecret("API_KEY");
  container.register("Config", config);
  
  console.log(`[SYSTEM] Environment: ${config.get("NODE_ENV")}`);
  // ... باقي عملية التشغيل
}
