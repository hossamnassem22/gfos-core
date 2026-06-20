import { SecretRotator } from "../rotator/SecretRotator.ts";

export class RuntimeSecretGuard {
  static async execute<T>(key: string, action: () => Promise<T>, rotator: SecretRotator): Promise<T> {
    await rotator.ensureFresh(key);
    return await action();
  }
}
