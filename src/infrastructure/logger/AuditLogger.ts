import { sql } from "../../infrastructure/database/connection.ts";

export class AuditLogger {
  static async log(userId: string, action: string, details: any) {
    await sql`
      INSERT INTO audit_logs (user_id, action, details, created_at)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)}, NOW())
    `;
  }
}
