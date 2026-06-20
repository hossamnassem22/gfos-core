export interface ProductionLine {
  id: string;
  status: 'OPERATIONAL' | 'IDLE' | 'MAINTENANCE';
  outputPerHour: number;
}

export class ProductionMonitor {
  static getEfficiency(line: ProductionLine): number {
    console.log(`[FACTORY] Calculating efficiency for line: ${line.id}`);
    return (line.outputPerHour / 100) * 100; // مثال: نسبة الكفاءة
  }
}
