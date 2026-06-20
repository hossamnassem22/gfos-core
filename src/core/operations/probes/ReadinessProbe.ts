export class ReadinessProbe {
  private static checks: Array<() => Promise<boolean>> = [];

  static register(check: () => Promise<boolean>) {
    this.checks.push(check);
  }

  static async isReady(): Promise<boolean> {
    for (const check of this.checks) {
      if (!(await check())) return false;
    }
    return true;
  }
}
