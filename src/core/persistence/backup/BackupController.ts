import { ReplicationStrategy } from "../replication/ReplicationStrategy.ts";

export class BackupController {
  constructor(private strategy: ReplicationStrategy) {}

  async performBackup(data: any) {
    console.log("[DR] Initializing secure backup protocol...");
    const success = await this.strategy.replicate(data);
    if (!success) {
      throw new Error("[CRITICAL] Backup replication failed - System integrity at risk");
    }
  }
}
