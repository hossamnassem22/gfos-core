import { EventStore, OptimisticLockError } from '../EventStore';
import { FinancialEvent } from '../../events/FinancialEvents';

/**
 * هذا الـ Implementation يمثل "الحارس الفعلي" للبيانات.
 * هنا يتم فرض الترتيب (Sequence) والذرة (Atomicity).
 */
export class SqlEventStore implements EventStore {
  // افترض وجود Database Pool
  constructor(private db: any) {}

  public async append(
    streamId: string,
    expectedVersion: number,
    events: FinancialEvent[]
  ): Promise<{ newVersion: number }> {
    return await this.db.transaction(async (trx: any) => {
      // 1. القفل الذري (Row-level lock على الـ Stream)
      const current = await trx('event_streams')
        .where({ stream_id: streamId })
        .forUpdate() 
        .first();

      const currentVersion = current ? current.version : 0;

      // 2. فرض الـ Optimistic Locking (القاعدة الذهبية)
      if (currentVersion !== expectedVersion) {
        throw new OptimisticLockError(streamId, expectedVersion, currentVersion);
      }

      // 3. الكتابة الذرية (Atomic Append)
      const newVersion = currentVersion + events.length;
      await trx('events').insert(events.map((e, i) => ({
        ...e,
        stream_id: streamId,
        sequence: currentVersion + i + 1
      })));

      // 4. تحديث الـ Stream Metadata
      await trx('event_streams')
        .where({ stream_id: streamId })
        .update({ version: newVersion, updated_at: new Date() });

      return { newVersion };
    });
  }

  public async getStream(streamId: string, fromVersion: number = 0): Promise<FinancialEvent[]> {
    return await this.db('events')
      .where({ stream_id: streamId })
      .andWhere('sequence', '>', fromVersion)
      .orderBy('sequence', 'asc');
  }
}
