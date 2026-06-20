import { MongoClient, Collection } from 'mongodb';
import { BaseEvent } from '../events/BaseEvent.ts';
import { IEventStore } from './EventStore.ts';

export class MongoEventStore implements IEventStore {
  private collection: Collection;

  constructor(db: any) {
    this.collection = db.collection('events');
  }

  async append(event: BaseEvent): Promise<void> {
    // فرض العزل أثناء الكتابة
    await this.collection.insertOne(event);
  }

  async getEventsByTenant(tenantId: string): Promise<BaseEvent[]> {
    // فرض العزل أثناء القراءة (التاجر لا يرى إلا أحداثه)
    return await this.collection.find({ tenantId }).toArray() as BaseEvent[];
  }
}
