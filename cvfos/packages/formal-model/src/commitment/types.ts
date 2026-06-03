/**
 * شهادة التزام للحالة (State Commitment)
 * تضمن أن الحالة في لحظة زمنية معينة لا يمكن التلاعب بها.
 */
export interface StateCommitment {
  readonly stateRoot: string;      // جذر ميركل للحالة (Merkle Root)
  readonly causalParent: string;   // هاش الحالة السابقة (Causal Link)
  readonly eventSignature: string; // توقيع الحدث الذي أدى للحالة
  readonly timestamp: number;      // وقت الالتزام
}
