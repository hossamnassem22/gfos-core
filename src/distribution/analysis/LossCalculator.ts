export class LossCalculator {
  static calculateLossRate(inputEnergy: number, billedEnergy: number): number {
    return ((inputEnergy - billedEnergy) / inputEnergy) * 100;
  }
}
