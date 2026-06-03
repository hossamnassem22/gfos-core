export interface DomainEvent {
  readonly id: string;
  readonly streamId: string;
  readonly sequence: bigint;
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: number;
}
