export interface CanonicalEvent<T> {
  eventId: string;
  eventType: string;
  payload: T;
  nodeId: string;
  sequenceNumber: bigint;
  parentHash: string | null;
  causalTime: bigint;
  eventHash: string;
}
