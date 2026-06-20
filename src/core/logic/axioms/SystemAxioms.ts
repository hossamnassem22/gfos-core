export class SystemAxioms {
  static validate(state: any): boolean {
    // القواعد الصورية (Formal Rules)
    const noDebtOnZeroBalance = state.balance > 0 || state.debt === 0;
    return noDebtOnZeroBalance;
  }
}
