import { AgreementRepository } from "../../core/ports/AgreementRepository.ts";

export class FakeAgreementRepository implements AgreementRepository {
  private data = new Map();

  async findById(id: string) {
    return this.data.get(id) || null;
  }

  async list() {
    return Array.from(this.data.values());
  }
}
