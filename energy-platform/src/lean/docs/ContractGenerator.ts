export class ContractGenerator {
  static generateSimpleContract(factory: string, retailer: string, details: string) {
    return `عقد توريد مبدئي بين ${factory} و ${retailer}. التفاصيل: ${details}. التاريخ: ${new Date().toISOString()}`;
  }
}
