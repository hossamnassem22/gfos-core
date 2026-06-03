export interface CanonicalEvent {
  readonly eventId: string;       // Unique ID
  readonly parentHash: string;    // Causal Link
  readonly nodeId: string;        // Originator
  readonly sequence: bigint;      // Local Causal Order
  readonly payload: unknown;
  readonly timestamp: bigint;     // Logical Time
}
