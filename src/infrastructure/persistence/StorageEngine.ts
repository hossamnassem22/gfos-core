const kv = await Deno.openKv();

export class StorageEngine {
  // حفظ قيد محاسبي بشكل دائم
  static async saveJournalEntry(entry: any) {
    const key = ["ledger", "entries", entry.entryId];
    await kv.set(key, entry);
    console.log(`[STORAGE]: تم حفظ القيد ${entry.entryId} في Deno KV`);
  }

  // استرجاع كافة القيود لغرض التدقيق
  static async getAllEntries() {
    const entries = [];
    for await (const res of kv.list({ prefix: ["ledger", "entries"] })) {
      entries.push(res.value);
    }
    return entries;
  }
}
