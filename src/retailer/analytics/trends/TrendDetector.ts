export class TrendDetector {
  static analyzeCategoryPerformance(salesData: number[]) {
    // حساب معدل النمو (Growth Rate) لكل تصنيف منتجات
    const latest = salesData[salesData.length - 1];
    const previous = salesData[salesData.length - 2];
    return ((latest - previous) / previous) * 100;
  }
}
