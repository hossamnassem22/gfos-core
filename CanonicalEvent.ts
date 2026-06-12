export type EventId = string;
export interface CanonicalEvent {
  readonly id: EventId;
  readonly parentIds: ReadonlyArray<EventId>;
  readonly payload: unknown;
  readonly sequenceHint: bigint;
  readonly hash: string;
}
