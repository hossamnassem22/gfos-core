export interface Product {
  id: string;
  name: string;
  stockLevel: number;
  minThreshold: number;
}

export class StockManager {
  static checkReplenishment(product: Product): boolean {
    return product.stockLevel <= product.minThreshold;
  }
}
