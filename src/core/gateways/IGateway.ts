export interface IGateway {
  name: string;
  verifyTransaction(transactionId: string): Promise<boolean>;
}
