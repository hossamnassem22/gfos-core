export class TimeOracle {
  private lastTime: number = 0;

  // يضمن أن الزمن دائماً يتحرك للأمام أو يبقى ثابتاً، ولا يتأثر بساعة النظام
  advance(proposedTime: number): number {
    if (proposedTime < this.lastTime) {
      throw new Error("TEMPORAL_VIOLATION_BACKWARDS_TIME");
    }
    this.lastTime = proposedTime;
    return this.lastTime;
  }

  getCurrent(): number {
    return this.lastTime;
  }
}
