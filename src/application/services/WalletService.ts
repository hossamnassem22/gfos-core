import { LedgerRepository } from "../../infrastructure/persistence/LedgerRepository.ts";

export class WalletService {
  constructor(private ledgerRepo: LedgerRepository) {}

  async getBalance(userId: string): Promise<bigint> {
    const entries = await this.ledgerRepo.getUserTransactions(userId);
    return entries.reduce((acc, entry) => {
      return entry.type === "DEBIT" ? acc + entry.amount.cents : acc - entry.amount.cents;
    }, 0n);
  }
}
