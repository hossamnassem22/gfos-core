import { JournalEntry } from "@domain/ledger/JournalEntry.ts";
import { StorageEngine } from "@engine/StorageEngine.ts";
import { AuditEngine } from "@kernel/AuditEngine.ts";

export class CommitEngine {
  constructor(
    private storage: StorageEngine,
    private auditor: AuditEngine
  ) {}

  async commit(entries: JournalEntry[]): Promise<void> {
    for (const entry of entries) {
      // 1. توليد بصمة التدقيق
      const signature = await this.auditor.hashEntry(entry);
      
      // 2. الحفظ مع البصمة (Audit Trail)
      await this.storage.saveJournalEntry(signature, { 
        ...entry, 
        auditHash: signature 
      });
    }
  }
}
