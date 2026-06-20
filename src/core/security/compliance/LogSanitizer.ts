export class LogSanitizer {
  private static SENSITIVE_FIELDS = ["password", "token", "auth_secret"];

  static sanitize(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    for (const field of this.SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    }
    return sanitized;
  }
}
