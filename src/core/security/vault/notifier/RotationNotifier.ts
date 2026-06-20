import { SecretObserver } from "../observer/SecretObserver.ts";

export class RotationNotifier {
  private observers: SecretObserver[] = [];

  subscribe(observer: SecretObserver) {
    this.observers.push(observer);
  }

  async notify(key: string, newValue: string) {
    await Promise.all(this.observers.map(o => o.onSecretChanged(key, newValue)));
    console.log(`[VAULT] Notification broadcasted for key: ${key}`);
  }
}
