import { BaseEvent } from './BaseEvent';

export interface DebtIssued extends BaseEvent {
  type: "DebtIssued";
  customerId: string;
  amount: number;
}
