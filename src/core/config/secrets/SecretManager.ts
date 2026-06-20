export class SecretManager {
  static getSecret(key: string): string {
    const value = Deno.env.get(key);
    if (!value) {
      throw new Error(`[SECURITY ALERT] Mandatory secret missing: ${key}`);
    }
    return value;
  }
}
