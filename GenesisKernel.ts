import { CommitSet } from "../ledger-core/CommitEngine";
import { CausalGraph } from "@genesis/algebra/CausalGraph";
import { CanonicalComparator } from "@genesis/algebra/CanonicalComparator";
export interface AccountState { readonly balance: bigint; readonly nonce: bigint; }
export type KernelState = ReadonlyMap<string, AccountState>;
export interface RejectionEvent { readonly eventId: string; readonly reason: string; }
export class GenesisKernel {
  static project(commitSet: CommitSet, graph: CausalGraph): { state: KernelState; rejections: ReadonlyArray<RejectionEvent> } {
    const state = new Map<string, AccountState>();
    const rejections: RejectionEvent[] = [];
    const ordered = Array.from(commitSet).map(id => graph.get(id)!).sort(CanonicalComparator.compare);
    for (const event of ordered) {
      const { from, to, amount } = event.payload as { from: string; to: string; amount: bigint };
      const fromAcc = state.get(from) ?? { balance: 0n, nonce: 0n };
      if (fromAcc.balance < amount) {
        rejections.push({ eventId: event.id, reason: "INSUFFICIENT_BALANCE" });
        continue;
      }
      state.set(from, { balance: fromAcc.balance - amount, nonce: fromAcc.nonce + 1n });
      const toAcc = state.get(to) ?? { balance: 0n, nonce: 0n };
      state.set(to, { balance: toAcc.balance + amount, nonce: toAcc.nonce });
    }
    return { state, rejections };
  }
}
