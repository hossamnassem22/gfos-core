export interface IncidentReport {
  errorCode: string;
  solution: string;
  successRate: number;
  lastVerified: string;
}

export class KnowledgeBase {
  private memory: Map<string, IncidentReport> = new Map();

  async store(report: IncidentReport) {
    this.memory.set(report.errorCode, report);
    console.log(`[LEARNING] Incident stored in system memory: ${report.errorCode}`);
  }
}
