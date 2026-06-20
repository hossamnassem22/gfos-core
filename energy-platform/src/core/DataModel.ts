export interface Order {
  id: string;
  retailerName: string;
  factoryName: string;
  product: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED';
}
export const orderRegistry: Order[] = [];
