import jwt from "npm:jsonwebtoken";

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "dev_secret_change_me";

export interface JwtPayload {
  userId: string;
  role: string;
}

export class JwtService {
  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}
