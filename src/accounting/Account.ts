export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalSide = 'DEBIT' | 'CREDIT';
export interface Account {
  code: string;
  name: string;
  category: AccountCategory;
  normalSide: NormalSide;
  isActive: boolean;
}
