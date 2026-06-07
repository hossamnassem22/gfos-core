import { Money } from "@domain/ledger/Money.ts";

export class TransferService {
  constructor(private repo: any) {}

  async transfer(from: string, to: string, amount: Money): Promise<void> {
    // التحويل يعتمد الآن على كائن Money الموحد
    await this.repo.save(from, to, amount);
  }
}
