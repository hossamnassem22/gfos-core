import { Money } from '../../domain/shared/Money';

export class PaymentService {
  private allocator: any; // سيتم تحديده لاحقاً كواجهة (Interface)

  async processPayment(
    _tenantId: string, 
    _debtId: string, 
    amount: bigint, 
    installments: string[]
  ): Promise<boolean> {
    try {
      const _allocations = this.allocator.allocate(Money.from(amount), installments);
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Payment processing failed:", e.message);
      }
      return false;
    }
  }
}
