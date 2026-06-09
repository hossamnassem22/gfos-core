import { ProcessedEventRepository } from "../../collections/subscribers/ProcessedEventRepository.ts";
import { TransactionContext } from "../../core/persistence/UnitOfWork.ts";

export class PostgresProcessedEventRepository implements ProcessedEventRepository {
  constructor(private db: any) {} // يمكن أن يكون Pool أو TransactionContext

  async hasProcessed(eventId: string, subscriberName: string): Promise<boolean> {
    const result = await this.db.queryObject<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM processed_events 
         WHERE event_id = $1 AND subscriber_name = $2
       )`,
      [eventId, subscriberName]
    );
    return result.rows[0].exists;
  }

  async markProcessed(eventId: string, subscriberName: string): Promise<void> {
    await this.db.queryObject(
      `INSERT INTO processed_events (event_id, subscriber_name) 
       VALUES ($1, $2)`,
      [eventId, subscriberName]
    );
  }
}
