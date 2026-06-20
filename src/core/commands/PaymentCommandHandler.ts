import { FinancialEvent } from '../events/FinancialEvents.ts';
import { FinancialSnapshot } from '../projection/FinancialSnapshot.ts';

export interface PaymentCommand {
  contractId: string;
  amount: bigint; // تم التعديل ليكون bigint لدعم العمليات المالية الدقيقة
  date: Date;
}

export class PaymentCommandHandler {
  /**
   * لا يغير الحالة مباشرة، بل يولد الحدث
   */
  public static handle(command: PaymentCommand, currentState: FinancialSnapshot): FinancialEvent {
    // 1. التحقق من منطق العمل (Business Validation)
    if (currentState.state.status === 'COMPLETED') {
      throw new Error("Cannot pay to a completed contract");
    }

    // 2. إصدار الحدث (Event Emission)
    return {
      type: "PAYMENT_RECEIVED",
      payload: {
        amount: command.amount,
        date: command.date
      }
    };
  }
}
