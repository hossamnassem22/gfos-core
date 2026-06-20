import { AgreementRepository } from "../ports/AgreementRepository.ts";
import { SecurityGuard } from "../../application/security/SecurityGuard.ts";
import { UserContext } from "../context/UserContext.ts";

export class AgreementService {
  constructor(private repo: AgreementRepository) {}

  async getAgreement(id: string) {
    SecurityGuard.check("agreement:read");

    const user = UserContext.get();

    const data = await this.repo.findById(id);

    if (!data || data.tenantId !== user.tenantId) {
      throw new Error("ACCESS_DENIED: tenant mismatch");
    }

    return data;
  }

  async listAgreements() {
    SecurityGuard.check("agreement:read");

    const user = UserContext.get();
    const list = await this.repo.list();

    return list.filter((x: any) => x.tenantId === user.tenantId);
  }
}
