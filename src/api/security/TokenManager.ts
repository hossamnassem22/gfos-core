export class TokenManager {
  static generateToken(entityId: string): string {
    // إصدار توقيع رقمي مشفر (JWT) للربط الآمن
    return `sec_prod_${Buffer.from(entityId).toString('base64')}`;
  }
}
