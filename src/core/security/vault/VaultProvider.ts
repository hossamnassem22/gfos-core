export interface VaultProvider {
  getSecret(key: string): Promise<string>;
  rotateSecret(key: string): Promise<void>;
}
