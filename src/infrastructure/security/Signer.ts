import { crypto } from "https://deno.land/std/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std/encoding/hex.ts";

export class Signer {
  static async sign(data: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return encodeHex(signature);
  }
}
