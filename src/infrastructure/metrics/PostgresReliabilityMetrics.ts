import { ReliabilityMetrics, OutboxSnapshot } from "../../collections/metrics/ReliabilityMetrics.ts";

export class PostgresReliabilityMetrics implements ReliabilityMetrics {
  constructor(private db: any) {}

  async getSnapshot(): Promise<OutboxSnapshot> {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing,
        COUNT(*) FILTER (WHERE status = 'SENT') as sent,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
        COUNT(*) FILTER (WHERE status = 'DEAD') as dead,
        COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(created_at))), 0) FILTER (WHERE status = 'PENDING') as oldest_pending_age,
        COUNT(*) FILTER (WHERE status = 'PROCESSING' AND processing_started_at < NOW() - INTERVAL '15 minutes') as stuck_processing
      FROM outbox_events;
    `;

    const result = await this.db.queryObject<any>(query);
    const row = result.rows[0];

    return {
      pending: parseInt(row.pending) || 0,
      processing: parseInt(row.processing) || 0,
      sent: parseInt(row.sent) || 0,
      failed: parseInt(row.failed) || 0,
      dead: parseInt(row.dead) || 0,
      oldestPendingAgeSeconds: Math.floor(parseFloat(row.oldest_pending_age)),
      stuckProcessingCount: parseInt(row.stuck_processing) || 0,
    };
  }
}
