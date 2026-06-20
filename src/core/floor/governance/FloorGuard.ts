export class FloorGuard {
  static enforce(action: string, context: any) {
    if (context.value < context.minLimit) {
      throw new Error("[FLOOR-VIOLATION] Cannot proceed: Threshold limit reached.");
    }
  }
}
