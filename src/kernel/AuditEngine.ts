import { JournalEntry } from "@domain/ledger/JournalEntry.ts";

export class AuditEngine {
  private lastHash: string = "GENESIS_BLOCK";

  async hashEntry(entry: JournalEntry): Promise<string> {
    const data = JSON.stringify(entry) + this.lastHash;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    this.lastHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return this.lastHash;
  }
}
