export interface EventEnvelope {
  readonly offset: bigint;         // الترتيب الفيزيائي
  readonly event: GenesisEvent;    // الحدث الجبري
  readonly causalHash: string;     // الالتزام السببي (Hash Chain)
  readonly merkleRoot: string;     // الالتزام الحالي (Merkle Anchor)
}

export interface EventStore {
  // كتابة ذرية (Atomic Write)
  append(event: GenesisEvent): Promise<EventEnvelope>;
  
  // قراءة حتمية للنطاق الزمني
  readRange(from: bigint, to: bigint): AsyncIterable<EventEnvelope>;
  
  // استرجاع الحالة بناءً على الـ Hash
  getByHash(hash: string): Promise<EventEnvelope | null>;
}
