import { KernelState } from "../kernel-core/GenesisKernel";
import { CommitSet } from "../ledger-core/CommitEngine";

export interface Snapshot {
  readonly rootHash: string; // Deterministic representation of CommitSet
  readonly state: KernelState;
  readonly lastEventId: string;
}

export class SnapshotProtocol {
  static create(root: CommitSet, state: KernelState, lastId: string): Snapshot {
    return {
      rootHash: Array.from(root).sort().join(":"),
      state,
      lastEventId: lastId
    };
  }

  static verify(snapshot: Snapshot, expectedRoot: string): boolean {
    return snapshot.rootHash === expectedRoot;
  }
}
