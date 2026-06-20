export interface ExchangeContract {
  partnerId: string;
  payload: Record<string, any>;
  signature: string; // التوقيع الرقمي لضمان سلامة المصدر
  version: string;
}
