import { CanonicalEvent } from "@genesis/algebra/events";

/**
 * GenesisAnchor: يمثل الحدث الأول الذي لا آباء له.
 * هذا هو المرجع الوحيد الذي تثق فيه العقدة للبدء.
 */
export const GENESIS_EVENT: CanonicalEvent = {
  id: "GENESIS_ROOT",
  parentIds: [],
  payload: { type: "INITIALIZATION", supply: 1000000n },
  sequenceHint: 0n,
  hash: "0x00000000000000000000000000000000"
};
