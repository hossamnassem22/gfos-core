export class ProductionSimulator {
  static simulateScenario(currentCapacity: number, demandGrowth: number) {
    const projectedOutput = currentCapacity * (1 + demandGrowth);
    console.log(`[SIMULATION] Projected output with ${demandGrowth * 100}% growth: ${projectedOutput}`);
    return projectedOutput;
  }
}
