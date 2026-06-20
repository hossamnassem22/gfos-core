export class EncryptionService {
  private readonly secretKey: string;

  constructor(key: string) {
    this.secretKey = key;
  }

  async encrypt(data: string): Promise<string> {
    // محاكاة لعملية تشفير مؤسسية (في الإنتاج نستخدم crypto.subtle)
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data + this.secretKey);
    return btoa(String.fromCharCode(...encoded));
  }

  async decrypt(encryptedData: string): Promise<string> {
    const decoded = atob(encryptedData);
    return decoded.replace(this.secretKey, "");
  }
}
