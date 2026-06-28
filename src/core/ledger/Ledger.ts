export class Ledger {
  private entries: any[] = [];

  async post(entry: { debit: number; credit: number; description: string; tenantId: string }) {
    const balance = entry.debit - entry.credit;
    this.entries.push({
      ...entry,
      balance,
      timestamp: new Date()
    });
    console.log(`📒 Ledger Entry: ${entry.description} | Balance: ${balance}`);
    return { success: true, balance };
  }

  async getBalance(tenantId: string) {
    return this.entries
      .filter(e => e.tenantId === tenantId)
      .reduce((sum, e) => sum + (e.debit - e.credit), 0);
  }
}

export const ledger = new Ledger();
