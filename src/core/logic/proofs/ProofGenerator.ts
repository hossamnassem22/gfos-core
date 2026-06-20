export class ProofGenerator {
  static generate(action: string, isValid: boolean): string {
    return `PROOF: { action: "${action}", status: "${isValid ? "VALID" : "INVALID"}", timestamp: "${Date.now()}" }`;
  }
}
