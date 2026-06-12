export interface Wallet {
  userId: string;
  balance: bigint; // نستخدم bigint لتمثيل القروش (Cents)
  currency: string;
}
