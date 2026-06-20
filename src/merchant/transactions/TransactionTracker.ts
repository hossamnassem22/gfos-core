export interface Transaction {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
  timestamp: string;
}

export class TransactionTracker {
  static getBalance(merchantId: string): number {
    console.log(`[MERCHANT] Calculating live balance for: ${merchantId}`);
    return 0; // يتم الربط بقاعدة البيانات
  }
}
