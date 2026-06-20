import Fastify from "npm:fastify";
import jwt from "npm:@fastify/jwt";

import authRoutes from "../interfaces/http/routes/auth.ts";
import tokenRoutes from "../interfaces/http/routes/token.ts";

export class Kernel {
  private app = Fastify({ logger: true });

  async start() {
    this.registerSecurity();
    this.registerRoutes();

    await this.app.listen({ port: 3011, host: "0.0.0.0" });
  }

  private registerSecurity() {
    this.app.register(jwt, {
      secret: Deno.env.get("JWT_SECRET")!,
    });
  }

  private registerRoutes() {
    this.app.register(authRoutes);
    this.app.register(tokenRoutes);
  }
}
