export class CostAnalyzer {
  static calculateUnitCost(materials: number, energy: number, labor: number): number {
    console.log("[FACTORY] Calculating unit production cost...");
    return materials + energy + labor;
  }
}
