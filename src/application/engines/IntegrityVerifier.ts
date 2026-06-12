import crypto from "node:crypto";

export class IntegrityVerifier {
  verify(data: string, hash: string): boolean {
    const check = crypto.createHash('sha256').update(data).digest('hex');
    return check === hash;
  }
}
