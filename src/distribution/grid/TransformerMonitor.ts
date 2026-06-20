export interface Transformer {
  id: string;
  loadPercentage: number;
  healthStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export class TransformerMonitor {
  static checkRisk(transformer: Transformer): boolean {
    return transformer.loadPercentage > 90; // حد الخطر للتحميل
  }
}
