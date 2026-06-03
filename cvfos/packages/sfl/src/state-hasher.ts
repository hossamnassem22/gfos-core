import crypto from 'crypto';

export interface SystemStateComponents {
  ledgerHash: string;
  ruleRegistryHash: string;
  lastEventHash: string;
  proofEngineHash: string;
}

export class GlobalStateHasher {
  static compute(state: SystemStateComponents): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(state))
      .digest('hex');
  }
}
