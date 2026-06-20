import { AgreementRepository } from "../../core/ports/AgreementRepository.ts";

export class AgreementRepositoryImpl implements AgreementRepository {
  async findById(id: string) {
    // DB call here
    return { id };
  }

  async list() {
    return [];
  }
}
