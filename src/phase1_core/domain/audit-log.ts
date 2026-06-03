export class AuditLogger {
  static log(action: string, id: string) { console.log(`📝 Audit: ${action} on ${id}`); }
}
