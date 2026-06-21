import { CanonicalEvent } from "@genesis/algebra/events";

export const GENESIS_EVENT: CanonicalEvent = {
  id: "AXIOM_ROOT",
  parentIds: [],
  payload: { type: "GENESIS", initialSupply: 1000000000n, config: { version: "1.0" } },
  sequenceHint: 0n,
  hash: "0xCAFEBABE000000000000000000000000"
};

export class Bootstrap {
  static getRoot(): CanonicalEvent {
    return GENESIS_EVENT;
  }
}
