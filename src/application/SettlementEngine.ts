import { SettlementPlan } from "@domain/settlement/SettlementPlan.ts";

export class SettlementEngine {
  createPlan(agreement: any, amount: any): SettlementPlan {
    // إضافة الخاصية المفقودة 'allocations' ليتوافق مع النوع المطلوب
    return new SettlementPlan(agreement, amount, []); 
  }
}
