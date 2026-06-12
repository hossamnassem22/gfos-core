import { DebtAgreement } from "./DebtAgreement.ts";

export class CommercialDebtAgreement implements DebtAgreement {
  public readonly status: string = "ACTIVE";

  constructor(
    public readonly id: string,
    public readonly totalAmount: number
  ) {}
}

export class RetailDebtAgreement implements DebtAgreement {
  public readonly status: string = "ACTIVE";

  constructor(
    public readonly id: string,
    public readonly totalAmount: number
  ) {}
}
