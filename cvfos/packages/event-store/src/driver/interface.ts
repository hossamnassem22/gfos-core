import { StoredEvent } from '../store';

export interface PersistenceDriver {
  append(event: StoredEvent): Promise<void>;
  readFrom(cursor: bigint): AsyncIterator<StoredEvent>;
  getLatestHead(): Promise<string>;
  // لضمان الاستمرارية بعد الفشل
  sync(): Promise<void>;
}
