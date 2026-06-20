export interface EscrowDeal {
  dealId: string;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
}

export class EscrowContract {
  private static ledger = new Map<string, EscrowDeal>();

  static createDeal(id: string, amount: number) {
    this.ledger.set(id, { dealId: id, amount, status: 'HELD' });
    console.log(`[ESCROW] Funds held for deal: ${id}`);
  }

  static releaseFunds(id: string) {
    const deal = this.ledger.get(id);
    if (deal) {
      deal.status = 'RELEASED';
      console.log(`[ESCROW] Funds released to factory for deal: ${id}`);
    }
  }
}
