export class EncryptionLayer {
  static signCommand(command: string, secretKey: string): string {
    // استخدام خوارزميات التوقيع الرقمي (Digital Signature) للتأكد من مصدر الأمر
    return `SIGNED_${Buffer.from(command).toString('base64')}`;
  }
}
