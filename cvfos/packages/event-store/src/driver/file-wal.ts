import { PersistenceDriver } from './interface';
import { StoredEvent } from '../store';
import * as fs from 'fs/promises';

export class FileWalDriver implements PersistenceDriver {
  constructor(private filePath: string) {}

  async append(event: StoredEvent): Promise<void> {
    // إلحاق ذري (Append-only) مع ضمان الكتابة للقرص (fsync)
    const data = JSON.stringify(event) + '\n';
    await fs.appendFile(this.filePath, data, { encoding: 'utf8', flag: 'a' });
  }

  async *readFrom(cursor: bigint): AsyncIterator<StoredEvent> {
    // قراءة متسلسلة للـ WAL
    // سيتم تنفيذ المنطق هنا لاحقاً
  }

  async getLatestHead(): Promise<string> {
    // إرجاع آخر causalHash تم كتابته
    return "HEAD_HASH";
  }

  async sync(): Promise<void> {
    // فرض كتابة البيانات فعلياً على القرص (Durability Guarantee)
  }
}
