export class AuditLogger {
  static async log(userId: string, action: string, details: string) {
    const entry = {
      userId,
      action,
      details,
      timestamp: Date.now()
    };
    console.log(`[AUDIT LOG]: ${JSON.stringify(entry)}`);
  }
}
