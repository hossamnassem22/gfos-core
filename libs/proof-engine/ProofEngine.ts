import { LedgerEntry } from '../../shared/contracts/AccountingContracts';
import { DomainEvent } from '../../shared/contracts/EventContracts';
import { CryptoChain } from '../crypto-chain/CryptoChain'; // من Cycle 1

export interface ProofSignal {
  timestamp: number;
  balanced: boolean;
  replayMatch: boolean;
  hashIntegrity: boolean;
  divergenceScore: number;
  affectedStreams: string[];
}

export class ProofEngine {
  async computeSignal(
    events: DomainEvent[], 
    actualLedger: LedgerEntry[],
    expectedHash: string
  ): Promise<ProofSignal> {
    
    // 1. حساب الـ Hash للواقع الحالي
    const currentHash = this.computeLedgerHash(actualLedger);
    const hashIntegrity = currentHash === expectedHash;

    // 2. التحقق من التوازن (Double-Entry Invariant)
    const balanced = this.verifyBalance(actualLedger);

    // 3. Replay Match: مقارنة السلسلة السببية
    const replayMatch = this.verifyCausalIntegrity(events);

    return {
      timestamp: Date.now(),
      balanced,
      replayMatch,
      hashIntegrity,
      divergenceScore: (!balanced || !replayMatch) ? 1.0 : 0.0,
      affectedStreams: [] // تحديد الـ Streams التي تسببت في الانحراف
    };
  }

  private verifyBalance(ledger: LedgerEntry[]): boolean {
    const sum = ledger.reduce((acc, e) => acc + e.amount, 0n);
    return sum === 0n;
  }

  private computeLedgerHash(ledger: LedgerEntry[]): string {
    return CryptoChain.hash(ledger); // توقيع الحالة الحالية
  }
}
