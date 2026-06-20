import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

export class TokenService {
  constructor(private secret: string) {}

  private key() {
    return new TextEncoder().encode(this.secret);
  }

  async signAccess(user: any) {
    return await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(this.key());
  }

  async signRefresh(user: any) {
    return await new jose.SignJWT({
      userId: user.id,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.key());
  }

  async verify(token: string) {
    const { payload } = await jose.jwtVerify(token, this.key());
    return payload;
  }
}
