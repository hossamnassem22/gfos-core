import { BaseEvent } from './BaseEvent';

export interface SaleRecorded extends BaseEvent {
  type: "SaleRecorded";
  productId: string;
  quantity: number;
  price: number;
}
