import { SecretObserver } from "@core/security/vault/observer/SecretObserver.ts";

export class DbSecretHandler implements SecretObserver {
  async onSecretChanged(key: string, newValue: string): Promise<void> {
    if (key === "DB_PASSWORD") {
      console.log("[DB] Reconfiguring connection with new credentials...");
      // تنفيذ منطق إعادة الاتصال هنا
    }
  }
}
