export class RecoveryStrategy {
  static async checkRecovery(probe: () => Promise<boolean>): Promise<boolean> {
    try {
      return await probe();
    } catch {
      return false;
    }
  }
}
