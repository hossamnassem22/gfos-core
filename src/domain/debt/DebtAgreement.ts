export interface DebtAgreement {
  readonly totalAmount: number;
  readonly status: string;
}

export class CommercialDebtAgreement implements DebtAgreement {
  constructor(public readonly totalAmount: number, public readonly status: string) {}
}

export class RetailDebtAgreement implements DebtAgreement {
  constructor(public readonly totalAmount: number, public readonly status: string) {}
}
