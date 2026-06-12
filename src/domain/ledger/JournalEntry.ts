import { JournalLine } from "@domain/ledger/entities/JournalLine.ts";
import { Money } from "@domain/shared/Money.ts";

export class JournalEntry {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly lines: JournalLine[],
    public readonly createdAt: Date = new Date()
  ) {}

  static create(id: string, tenantId: string, lines: JournalLine[]): JournalEntry {
    return new JournalEntry(id, tenantId, lines);
  }
}
