export interface Allocation {
  id: string;
}

export class SettlementPlan {
  constructor(
    public readonly agreement: any,
    public readonly amount: any,
    public readonly allocations: Allocation[] = []
  ) {}
}
