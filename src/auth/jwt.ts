import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "dev-secret";
const ALGORITHM: "HS256" = "HS256";

export async function createJwt(payload: Record<string, unknown>, expiresInSec = 60 * 60 * 24) {
  const jwt = await create({ alg: ALGORITHM, typ: "JWT" }, { ...payload, exp: getNumericDate(expiresInSec) }, JWT_SECRET);
  return jwt;
}

export async function verifyJwt(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET, ALGORITHM);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err };
  }
}
