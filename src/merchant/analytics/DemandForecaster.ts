export class DemandForecaster {
  static predictNeed(historicalSales: number[]): number {
    // تطبيق متوسط متحرك (Moving Average) للتنبؤ بالطلب المستقبلي
    const average = historicalSales.reduce((a, b) => a + b) / historicalSales.length;
    return Math.ceil(average * 1.2); // إضافة 20% كأمان للمخزون
  }
}
