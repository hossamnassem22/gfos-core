import { pool } from "../database/connection.ts";

export class AuditLogger {

  static async log(event: {
    userId?: number;
    action: string;
    path: string;
    status: number;
    traceId?: string;
  }) {

    const client = await pool.connect();

    try {
      await client.queryObject(
        `INSERT INTO audit_logs
         (user_id, action, path, status, trace_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          event.userId ?? null,
          event.action,
          event.path,
          event.status,
          event.traceId ?? null
        ]
      );
    } finally {
      client.release();
    }
  }
}
