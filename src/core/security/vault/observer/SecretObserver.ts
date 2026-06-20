export interface SecretObserver {
  onSecretChanged(key: string, newValue: string): Promise<void>;
}
