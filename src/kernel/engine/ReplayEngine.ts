import { StorageEngine } from "@engine/StorageEngine.ts";

export class ReplayEngine {
  constructor(private storage: StorageEngine) {}

  async recover(): Promise<any> {
    // 1. استرجاع آخر Snapshot
    // 2. استرجاع الـ Event Stream
    // 3. إعادة التشغيل (Replay) للوصول للحالة النهائية
    return await this.storage.loadSnapshot(); 
  }
}
