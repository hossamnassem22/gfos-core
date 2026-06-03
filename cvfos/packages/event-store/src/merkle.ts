import crypto from 'crypto';

export class MerkleAnchor {
  static computeRoot(currentRoot: string, eventHash: string): string {
    // هجين بين Hash Chain و Merkle Tree
    return crypto
      .createHash('sha256')
      .update(currentRoot + eventHash)
      .digest('hex');
  }
}
