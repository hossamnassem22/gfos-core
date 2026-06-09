import { OutboxEvent } from "../../collections/events/OutboxEvent.ts";
import { OutboxRepository } from "../../collections/events/OutboxRepository.ts";
import { TransactionContext } from "../../core/persistence/UnitOfWork.ts";

export class PostgresOutboxRepository implements OutboxRepository {
  async save(event: OutboxEvent, tx: TransactionContext): Promise<void> {
    await tx.query(
      `INSERT INTO outbox_events (event_id, aggregate_id, event_type, payload, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [event.id, event.aggregateId, event.eventType, JSON.stringify(event.payload), event.status]
    );
  }

  async claimPending(batchSize: number): Promise<OutboxEvent[]> {
    // استخدام SKIP LOCKED للعمل المتوازي (Concurrency)
    const result = await globalThis.db.queryObject<OutboxEvent>(
      `UPDATE outbox_events 
       SET status = 'PROCESSING', processing_started_at = NOW()
       WHERE event_id IN (
         SELECT event_id FROM outbox_events 
         WHERE status = 'PENDING' OR (status = 'FAILED' AND next_retry_at <= NOW())
         ORDER BY created_at ASC LIMIT $1
         FOR UPDATE SKIP LOCKED
       )
       RETURNING *`,
      [batchSize]
    );
    return result.rows;
  }

  async markSent(eventId: string): Promise<void> {
    await globalThis.db.queryObject(
      `UPDATE outbox_events SET status = 'SENT', sent_at = NOW() WHERE event_id = $1`,
      [eventId]
    );
  }

  async markFailed(eventId: string, error: string, nextRetryAt: Date): Promise<void> {
    await globalThis.db.queryObject(
      `UPDATE outbox_events 
       SET status = 'FAILED', attempts = attempts + 1, last_error = $1, next_retry_at = $2 
       WHERE event_id = $3`,
      [error, nextRetryAt, eventId]
    );
  }

  async markDead(eventId: string): Promise<void> {
    await globalThis.db.queryObject(
      `UPDATE outbox_events SET status = 'DEAD' WHERE event_id = $1`,
      [eventId]
    );
  }
}
