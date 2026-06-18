import Fastify, { FastifyInstance } from "npm:fastify";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export class HttpKernel {
  app: FastifyInstance;

  constructor() {
    this.app = Fastify({ logger: true });
  }

  async registerCore() {
    this.app.get("/api", async () => {
      return {
        status: "OK",
        service: "GFOS Kernel API"
      };
    });
  }

  async loadRoutes() {
    const routesPath = join("src/interfaces/http/routes");
    const files = readdirSync(routesPath);

    for (const file of files) {
      if (!file.endsWith(".ts")) continue;

      const mod = await import(`./routes/${file}`);

      const routeFn = Object.values(mod).find(v => typeof v === "function");

      if (!routeFn) continue;

      await this.app.register(routeFn, {
        prefix: "/api"
      });
    }
  }

  async start(port = 3000) {
    await this.registerCore();
    await this.loadRoutes();

    await this.app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Kernel running on http://localhost:${port}`);
  }
}
