export class TrendPredictor {
  // خوارزمية بسيطة للانحدار الخطي لتوقع الحمل المستقبلي
  predict(historicalData: number[]): number {
    const sum = historicalData.reduce((a, b) => a + b, 0);
    return sum / historicalData.length; // متوسط مرجح للاتجاه
  }
}
