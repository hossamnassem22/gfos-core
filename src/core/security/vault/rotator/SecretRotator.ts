import { VaultProvider } from "../VaultProvider.ts";

export class SecretRotator {
  constructor(private vault: VaultProvider) {}

  async ensureFresh(key: string) {
    // منطق التحقق من صلاحية السر (مثلاً: التحقق من طابع زمني)
    console.log(`[VAULT] Checking rotation status for: ${key}`);
    await this.vault.rotateSecret(key);
  }
}
