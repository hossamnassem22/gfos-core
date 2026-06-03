export class AllocationEngine {
  
  // استبدال any بنوع عام T أو واجهة محددة
  public async allocate(payment: unknown): Promise<void> {
    const _payment = payment; 
    // منطق التوزيع المالي
  }

  private calculateDistribution(
    _payment: unknown, 
    _debts: unknown[]
  ): void {
    const _debtsList = _debts;
    // استخدام reduce مع تعريف الأنواع بدلاً من any
    const _total = _debtsList.reduce((acc: number, _debt: unknown) => {
      return acc + 0;
    }, 0);
  }
}
