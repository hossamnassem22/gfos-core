import { CausalGraph } from "@genesis/algebra/CausalGraph";
import { HardenedDeltaEngine } from "../sync-core/DeltaEngine";
import { CanonicalEvent } from "@genesis/algebra/events";

export interface NodeView {
  getFrontierIds(): Set<string>;
  receiveDelta(delta: CanonicalEvent[]): void;
}

export class ReconciliationProtocol {
  constructor(private readonly localGraph: CausalGraph) {}

  // استراتيجية المصالحة: دفع الحقيقة الناقصة للطرف الآخر
  reconcile(remote: NodeView): void {
    const remoteFrontier = remote.getFrontierIds();
    const delta = HardenedDeltaEngine.computeDelta(this.localGraph, remoteFrontier);
    
    if (delta.length > 0) {
      remote.receiveDelta(delta);
    }
  }
}
