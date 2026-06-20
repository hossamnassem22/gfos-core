import jwt from "npm:@fastify/jwt";

export class JwtService {
  constructor(private secret: string) {
    if (!secret) throw new Error("JWT secret is required");
  }

  sign(payload: object) {
    return jwt.sign(payload, this.secret);
  }

  verify(token: string) {
    return jwt.verify(token, this.secret);
  }
}
