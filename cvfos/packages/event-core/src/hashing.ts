import crypto from 'crypto';

export class EventHasher {
  static compute(event: any, previousHash: string): string {
    const data = JSON.stringify({ event, previousHash });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
