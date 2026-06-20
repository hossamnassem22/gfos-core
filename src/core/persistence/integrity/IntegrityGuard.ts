export class IntegrityGuard {
  static generateHash(data: any): string {
    // محاكاة لخوارزمية تشفير (SHA-256)
    return btoa(JSON.stringify(data)); 
  }

  static verify(data: any, expectedHash: string): boolean {
    return this.generateHash(data) === expectedHash;
  }
}
