import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

export class AgreementSigner {
  static async sign(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(dataString));
    
    // تحويل الـ ArrayBuffer إلى Hex String
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
}
