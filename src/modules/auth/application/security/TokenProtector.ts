import { EncryptionService } from "../../../../core/security/encryption/EncryptionService.ts";

export class TokenProtector {
  constructor(private encryption: EncryptionService) {}

  async protect(token: string): Promise<string> {
    return await this.encryption.encrypt(token);
  }

  async reveal(encryptedToken: string): Promise<string> {
    return await this.encryption.decrypt(encryptedToken);
  }
}
