export class StorageEngine {
  private kv!: Deno.Kv;

  async init(): Promise<void> {
    this.kv = await Deno.openKv();
  }

  async appendEvent(id: string, data: any): Promise<void> {
    await this.kv.set(["events", id], data);
  }

  async saveJournalEntry(id: string, entry: any): Promise<void> {
    await this.kv.set(["journal", id], entry);
  }

  async saveSnapshot(state: any): Promise<void> {
    await this.kv.set(["snapshot"], state);
  }
}
