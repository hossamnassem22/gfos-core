import { KernelState } from "../kernel/GenesisKernel";
import { CommitSet } from "../ledger-core/CommitEngine";

/**
 * Canonical Snapshot: يمثل "تجميد" للحالة المالية في لحظة سببية معينة.
 */
export interface Snapshot {
  readonly rootHash: string; // CommitRoot
  readonly state: KernelState;
  readonly lastEventId: string;
}

export class SnapshotEngine {
  // يضمن أن الـ Snapshot حتمي تماماً
  static create(root: CommitSet, state: KernelState, lastId: string): Snapshot {
    return {
      rootHash: Array.from(root).sort().join(":"),
      state,
      lastEventId: lastId
    };
  }
}
