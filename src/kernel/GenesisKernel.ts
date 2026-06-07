import { SnapshotEngine } from "@engine/SnapshotEngine.ts";

export class GenesisKernel {
  private state: Record<string, any> = {};
  
  constructor(private snapshotEngine: SnapshotEngine) {}

  async executeAction(action: string): Promise<void> {
    this.state[action] = true;
    await this.snapshotEngine.save(this.state);
  }

  getState(): Record<string, any> {
    return { ...this.state };
  }
}
