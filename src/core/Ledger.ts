export interface Entry {
  accountId: string;
  amount: number; // موجب للمدين، سالب للدائن
}

export class Ledger {
  static validateBalance(entries: Entry[]): boolean {
    const sum = entries.reduce((acc, entry) => acc + entry.amount, 0);
    return sum === 0;
  }
}
