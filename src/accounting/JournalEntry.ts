export interface EntryLine { accountCode: string; debit: number; credit: number; }
export class JournalEntry {
  constructor(
    public readonly referenceId: string,
    public readonly referenceType: string,
    public readonly description: string,
    public readonly lines: EntryLine[],
    public readonly timestamp: Date = new Date()
  ) {}
  static create(data: any) { return new JournalEntry(data.referenceId, data.referenceType, data.description, data.lines); }
}
