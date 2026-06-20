import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";
import { TokenServicePort } from "../../domain/ports/TokenServicePort.ts";

export class JwtTokenService implements TokenServicePort {
  private key: Uint8Array;

  constructor(secret: string) {
    this.key = new TextEncoder().encode(secret);
  }

  async signAccess(payload: any): Promise<string> {
    return await new jose.SignJWT({ ...payload, type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(this.key);
  }

  async signRefresh(payload: any): Promise<string> {
    return await new jose.SignJWT({ ...payload, type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.key);
  }

  async verify(token: string): Promise<any> {
    const { payload } = await jose.jwtVerify(token, this.key);
    return payload;
  }
}
